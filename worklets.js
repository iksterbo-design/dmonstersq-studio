/* =====================================================================
   D MONSTERS Q STUDIO — AudioWorklet DSP processors
   Runs on the audio render thread (real DSP, not the JS main thread).
   Processors:  dmq-gate · dmq-limiter · dmq-crusher
   ===================================================================== */
const DB_LO = 1e-7;

/* ---------- Noise gate: envelope follower + attack/hold/release ---------- */
class GateProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'threshold', defaultValue: -45, minValue: -100, maxValue: 0,  automationRate: 'k-rate' },
      { name: 'attack',    defaultValue: 0.002, minValue: 0.0002, maxValue: 1, automationRate: 'k-rate' },
      { name: 'hold',      defaultValue: 0.05, minValue: 0, maxValue: 2,   automationRate: 'k-rate' },
      { name: 'release',   defaultValue: 0.12, minValue: 0.005, maxValue: 3, automationRate: 'k-rate' },
      { name: 'range',     defaultValue: -80, minValue: -100, maxValue: 0, automationRate: 'k-rate' },
      { name: 'bypass',    defaultValue: 0,   minValue: 0, maxValue: 1,   automationRate: 'k-rate' }
    ];
  }
  constructor() {
    super();
    this.env = 0;          // envelope follower state
    this.gain = 1;         // current gate gain
    this.holdLeft = 0;     // hold counter in samples
    this.chGain = [1, 1];  // per-channel gain (linked, kept for safety)
  }
  process(inputs, outputs, params) {
    const input = inputs[0], output = outputs[0];
    if (!input || !input.length) return true;
    const th    = params.threshold[0];
    const atk   = params.attack[0];
    const hold  = params.hold[0];
    const rel   = params.release[0];
    const floor = Math.pow(10, params.range[0] / 20);
    const bypass = params.bypass[0] > 0.5;

    const sr = sampleRate;
    const envAtk = Math.exp(-1 / (sr * 0.0008));   // fast envelope attack
    const envRel = Math.exp(-1 / (sr * 0.05));     // envelope release
    const gAtk   = Math.exp(-1 / (sr * atk));
    const gRel   = Math.exp(-1 / (sr * rel));
    const holdN  = hold * sr;

    const frames = output[0].length;
    for (let i = 0; i < frames; i++) {
      // peak across channels
      let peak = 0;
      for (let ch = 0; ch < input.length; ch++) {
        const a = Math.abs(input[ch][i]);
        if (a > peak) peak = a;
      }
      this.env = peak > this.env ? peak : this.env * envRel;
      if (peak > this.env) this.env = peak;
      // smooth the envelope's own attack a touch
      this.env = this.env * (1 - (1 - envAtk)) + 0;

      const db = 20 * Math.log10(this.env + DB_LO);

      let target;
      if (bypass) { target = 1; }
      else if (db > th) { target = 1; this.holdLeft = holdN; }
      else if (this.holdLeft > 0) { target = 1; this.holdLeft--; }
      else { target = floor; }

      const coef = target > this.gain ? gAtk : gRel;
      this.gain = target + (this.gain - target) * coef;

      for (let ch = 0; ch < output.length; ch++) {
        const inp = input[ch] || input[0];
        output[ch][i] = inp[i] * this.gain;
      }
    }
    return true;
  }
}
registerProcessor('dmq-gate', GateProcessor);

/* ---------- Brickwall limiter: instant attack, smooth release ---------- */
class LimiterProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'ceiling', defaultValue: -1,  minValue: -24, maxValue: 0,   automationRate: 'k-rate' },
      { name: 'release', defaultValue: 0.1, minValue: 0.005, maxValue: 2, automationRate: 'k-rate' },
      { name: 'bypass',  defaultValue: 1,   minValue: 0, maxValue: 1,     automationRate: 'k-rate' }
    ];
  }
  constructor() { super(); this.gain = 1; }
  process(inputs, outputs, params) {
    const input = inputs[0], output = outputs[0];
    if (!input || !input.length) return true;
    const ceil = Math.pow(10, params.ceiling[0] / 20);
    const relCoef = Math.exp(-1 / (sampleRate * params.release[0]));
    const bypass = params.bypass[0] > 0.5;
    const frames = output[0].length;
    for (let i = 0; i < frames; i++) {
      let peak = 0;
      for (let ch = 0; ch < input.length; ch++) {
        const a = Math.abs(input[ch][i]);
        if (a > peak) peak = a;
      }
      let target = 1;
      if (!bypass && peak > ceil) target = ceil / peak;
      if (target < this.gain) this.gain = target;                        // instant attack
      else this.gain = target + (this.gain - target) * relCoef;          // smooth release
      for (let ch = 0; ch < output.length; ch++) {
        const inp = input[ch] || input[0];
        output[ch][i] = inp[i] * this.gain;
      }
    }
    return true;
  }
}
registerProcessor('dmq-limiter', LimiterProcessor);

/* ---------- Bitcrusher: bit-depth + sample-rate reduction ---------- */
class CrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'bits',      defaultValue: 8, minValue: 1,  maxValue: 16, automationRate: 'k-rate' },
      { name: 'reduction', defaultValue: 1, minValue: 1,  maxValue: 50, automationRate: 'k-rate' },
      { name: 'mix',       defaultValue: 1, minValue: 0,  maxValue: 1,  automationRate: 'k-rate' },
      { name: 'bypass',    defaultValue: 1, minValue: 0,  maxValue: 1,  automationRate: 'k-rate' }
    ];
  }
  constructor() { super(); this.phase = 0; this.held = [0, 0]; }
  process(inputs, outputs, params) {
    const input = inputs[0], output = outputs[0];
    if (!input || !input.length) return true;
    const bits = params.bits[0];
    const red  = Math.max(1, Math.round(params.reduction[0]));
    const mix  = params.mix[0];
    const bypass = params.bypass[0] > 0.5;
    const step = Math.pow(0.5, bits - 1);
    const frames = output[0].length;
    for (let i = 0; i < frames; i++) {
      if (red > 1) { this.phase++; if (this.phase >= red) this.phase = 0; }
      for (let ch = 0; ch < output.length; ch++) {
        const inp = input[ch] || input[0];
        const x = inp[i];
        if (bypass) { output[ch][i] = x; continue; }
        const q = Math.round(x / step) * step;              // bit-depth crush
        let y = q;
        if (red > 1) {                                      // sample-rate crush
          if (this.phase === 0) this.held[ch] = q;
          y = this.held[ch];
        }
        output[ch][i] = x * (1 - mix) + y * mix;
      }
    }
    return true;
  }
}
registerProcessor('dmq-crusher', CrusherProcessor);

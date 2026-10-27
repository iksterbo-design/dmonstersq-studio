/* D MONSTERS Q STUDIO — 100 DJ TOOLS & TOOL SETS */
(function(){
  'use strict';
  const SETS = [
    { id:'beatmatch', name:'BEATMATCH', icon:'🎯', tools:[
      {id:'sync', name:'Sync BPM', icon:'🔄', desc:'Match track BPM to master'},
      {id:'taptempo', name:'Tap Tempo', icon:'👆', desc:'Tap to set BPM'},
      {id:'bpmdetect', name:'BPM Detect', icon:'🔍', desc:'Auto-detect track BPM'},
      {id:'beatgrid', name:'Beat Grid', icon:'📏', desc:'Show beat grid overlay'},
      {id:'phasealign', name:'Phase Align', icon:'🔗', desc:'Align phase to master'},
      {id:'nudgeplus', name:'Nudge +', icon:'➡️', desc:'+10ms nudge'},
      {id:'nudgeminus', name:'Nudge -', icon:'⬅️', desc:'-10ms nudge'},
      {id:'pitchbendup', name:'Pitch Bend +', icon:'⬆️', desc:'Pitch bend up'},
      {id:'pitchbenddown', name:'Pitch Bend -', icon:'⬇️', desc:'Pitch bend down'},
      {id:'keylock', name:'Key Lock', icon:'🔒', desc:'Lock musical key'},
    ]},
    { id:'cueloop', name:'CUE & LOOP', icon:'🔁', tools:[
      {id:'cueset', name:'Cue Set', icon:'📍', desc:'Set cue point at playhead'},
      {id:'cuejump', name:'Cue Jump', icon:'↪️', desc:'Jump to cue point'},
      {id:'cuea', name:'Hot Cue A', icon:'🅰️', desc:'Hot cue A'},
      {id:'cueb', name:'Hot Cue B', icon:'🅱️', desc:'Hot cue B'},
      {id:'cuec', name:'Hot Cue C', icon:'©️', desc:'Hot cue C'},
      {id:'loopin', name:'Loop In', icon:'[', desc:'Set loop in point'},
      {id:'loopout', name:'Loop Out', icon:']', desc:'Set loop out point'},
      {id:'looproll', name:'Loop Roll', icon:'🔄', desc:'Momentary loop roll'},
      {id:'reloop', name:'Reloop', icon:'↩️', desc:'Exit & re-enter loop'},
      {id:'slipmode', name:'Slip Mode', icon:'🛷', desc:'Slip mode on/off'},
    ]},
    { id:'perf', name:'PERFORMANCE', icon:'🎛️', tools:[
      {id:'scratch', name:'Scratch', icon:'💿', desc:'Vinyl scratch mode'},
      {id:'vinylbrake', name:'Vinyl Brake', icon:'🛑', desc:'Vinyl brake stop'},
      {id:'spinback', name:'Spinback', icon:'↩️', desc:'Spinback effect'},
      {id:'transform', name:'Transform', icon:'✂️', desc:'Transform chop'},
      {id:'stutter', name:'Stutter', icon:'stutter', desc:'Stutter repeat'},
      {id:'gatechop', name:'Gate Chop', icon:'🚪', desc:'Gate chop pattern'},
      {id:'beatrepeat', name:'Beat Repeat', icon:'🔁', desc:'Beat repeat'},
      {id:'roll14', name:'Roll 1/4', icon:'4', desc:'1/4 beat roll'},
      {id:'roll18', name:'Roll 1/8', icon:'8', desc:'1/8 beat roll'},
      {id:'roll116', name:'Roll 1/16', icon:'16', desc:'1/16 beat roll'},
    ]},
    { id:'fxthrows', name:'FX THROWS', icon:'✨', tools:[
      {id:'filtersweep', name:'Filter Sweep', icon:'🎚️', desc:'Automated filter sweep'},
      {id:'delaythrow', name:'Delay Throw', icon:'📣', desc:'Throw to delay'},
      {id:'reverbwash', name:'Reverb Wash', icon:'🌊', desc:'Reverb wash'},
      {id:'flangersweep', name:'Flanger Sweep', icon:'🌀', desc:'Flanger sweep'},
      {id:'phasersweep', name:'Phaser Sweep', icon:'🌪️', desc:'Phaser sweep'},
      {id:'echoout', name:'Echo Out', icon:'🔊', desc:'Echo out tail'},
      {id:'riser', name:'Riser', icon:'📈', desc:'Build riser'},
      {id:'drop', name:'Drop', icon:'📉', desc:'Impact drop'},
      {id:'buildup', name:'Build-Up', icon:'⬆️', desc:'Energy build-up'},
      {id:'breakdown', name:'Breakdown', icon:'⬇️', desc:'Breakdown section'},
    ]},
    { id:'sampler', name:'SAMPLER', icon:'🥁', tools:[
      {id:'pad1', name:'Pad 1', icon:'1', desc:'Trigger sample pad 1'},
      {id:'pad2', name:'Pad 2', icon:'2', desc:'Trigger sample pad 2'},
      {id:'pad3', name:'Pad 3', icon:'3', desc:'Trigger sample pad 3'},
      {id:'pad4', name:'Pad 4', icon:'4', desc:'Trigger sample pad 4'},
      {id:'pad5', name:'Pad 5', icon:'5', desc:'Trigger sample pad 5'},
      {id:'pad6', name:'Pad 6', icon:'6', desc:'Trigger sample pad 6'},
      {id:'pad7', name:'Pad 7', icon:'7', desc:'Trigger sample pad 7'},
      {id:'pad8', name:'Pad 8', icon:'8', desc:'Trigger sample pad 8'},
      {id:'pad9', name:'Pad 9', icon:'9', desc:'Trigger sample pad 9'},
      {id:'pad10', name:'Pad 10', icon:'🔟', desc:'Trigger sample pad 10'},
    ]},
    { id:'eqfilter', name:'EQ & FILTER', icon:'🎚️', tools:[
      {id:'lowkill', name:'Low Kill', icon:'🔇', desc:'Kill low band'},
      {id:'midkill', name:'Mid Kill', icon:'🔇', desc:'Kill mid band'},
      {id:'highkill', name:'High Kill', icon:'🔇', desc:'Kill high band'},
      {id:'lowboost', name:'Low Boost', icon:'🔊', desc:'Boost low band'},
      {id:'filteropen', name:'Filter Open', icon:'🔓', desc:'Open filter'},
      {id:'filterclose', name:'Filter Close', icon:'🔒', desc:'Close filter'},
      {id:'notchsweep', name:'Notch Sweep', icon:'〰️', desc:'Notch sweep'},
      {id:'bandpass', name:'Bandpass', icon:'🎯', desc:'Bandpass mode'},
      {id:'hpsweep', name:'HP Sweep', icon:'⬆️', desc:'Highpass sweep'},
      {id:'lpsweep', name:'LP Sweep', icon:'⬇️', desc:'Lowpass sweep'},
    ]},
    { id:'dynamics', name:'DYNAMICS', icon:'💪', tools:[
      {id:'pump', name:'Pump', icon:'💨', desc:'Sidechain pump'},
      {id:'sidechain', name:'Sidechain', icon:'🔗', desc:'Sidechain compress'},
      {id:'compboost', name:'Comp Boost', icon:'📈', desc:'Compression boost'},
      {id:'limiterslam', name:'Limiter Slam', icon:'🔨', desc:'Limiter slam'},
      {id:'transientshaper', name:'Transient Shaper', icon:'⚡', desc:'Transient shaping'},
      {id:'glue', name:'Glue', icon:'🔗', desc:'Glue compression'},
      {id:'punch', name:'Punch', icon:'👊', desc:'Punch enhancer'},
      {id:'sustain', name:'Sustain', icon:'⏳', desc:'Sustain boost'},
      {id:'gate', name:'Gate', icon:'🚪', desc:'Noise gate'},
      {id:'expander', name:'Expander', icon:'↔️', desc:'Expander'},
    ]},
    { id:'spatial', name:'SPATIAL', icon:'🌐', tools:[
      {id:'stereowidth', name:'Stereo Width', icon:'↔️', desc:'Widen stereo'},
      {id:'mono', name:'Mono', icon:'1', desc:'Mono sum'},
      {id:'panl', name:'Pan L', icon:'⬅️', desc:'Pan left'},
      {id:'panr', name:'Pan R', icon:'➡️', desc:'Pan right'},
      {id:'autopan', name:'Auto Pan', icon:'🔄', desc:'Auto pan'},
      {id:'haas', name:'Haas', icon:'📐', desc:'Haas effect'},
      {id:'reverbhall', name:'Reverb Hall', icon:'🏛️', desc:'Hall reverb'},
      {id:'reverbplate', name:'Reverb Plate', icon:'🍽️', desc:'Plate reverb'},
      {id:'delaypingpong', name:'Delay PingPong', icon:'🏓', desc:'Ping-pong delay'},
      {id:'delaytape', name:'Delay Tape', icon:'📼', desc:'Tape delay'},
    ]},
    { id:'vocal', name:'VOCAL', icon:'🎤', tools:[
      {id:'vocalcut', name:'Vocal Cut', icon:'✂️', desc:'Cut vocals'},
      {id:'vocalboost', name:'Vocal Boost', icon:'📈', desc:'Boost vocals'},
      {id:'deesser', name:'De-Esser', icon:'🐍', desc:'De-ess sibilance'},
      {id:'pitchcorrect', name:'Pitch Correct', icon:'🎵', desc:'Pitch correction'},
      {id:'harmonizer', name:'Harmonizer', icon:'🎼', desc:'Harmonize'},
      {id:'vocoder', name:'Vocoder', icon:'🤖', desc:'Vocoder effect'},
      {id:'talkoverduck', name:'Talkover Duck', icon:'🦆', desc:'Duck for talkover'},
      {id:'radioeq', name:'Radio EQ', icon:'📻', desc:'Radio EQ'},
      {id:'telephone', name:'Telephone', icon:'📞', desc:'Telephone filter'},
      {id:'megaphone', name:'Megaphone', icon:'📢', desc:'Megaphone effect'},
    ]},
    { id:'mastering', name:'MASTERING', icon:'🏆', tools:[
      {id:'loudness', name:'Loudness', icon:'📢', desc:'Loudness maximize'},
      {id:'truepeak', name:'True Peak', icon:'📏', desc:'True peak limit'},
      {id:'stereoimager', name:'Stereo Imager', icon:'🌐', desc:'Stereo imaging'},
      {id:'multiband', name:'Multiband', icon:'📊', desc:'Multiband comp'},
      {id:'finaleq', name:'Final EQ', icon:'🎚️', desc:'Final EQ'},
      {id:'finalcomp', name:'Final Comp', icon:'💪', desc:'Final compressor'},
      {id:'dither', name:'Dither', icon:'🎲', desc:'Dither'},
      {id:'fadein', name:'Fade In', icon:'↗️', desc:'Fade in'},
      {id:'fadeout', name:'Fade Out', icon:'↘️', desc:'Fade out'},
      {id:'exportcue', name:'Export Cue', icon:'⬇️', desc:'Export with cue'},
    ]},
  ];
  window.DJ_SETS = SETS;
  const active = new Set();
  window.djIsActive = function(id){ return active.has(id); };
  window.djToggle = function(id){
    if(active.has(id)){ active.delete(id); } else { active.add(id); }
    const btn = document.querySelector('[data-dj="'+id+'"]');
    if(btn) btn.classList.toggle('on', active.has(id));
    var h = window.DJ_HANDLERS && window.DJ_HANDLERS[id];
    if(typeof h === 'function') try { h(active.has(id)); } catch(e){ console.warn(e); }
    if(window.toast) toast((active.has(id)?'ON: ':'OFF: ') + id);
    return active.has(id);
  };
  window.DJ_HANDLERS = {};
  window.DJ_HANDLERS['taptempo'] = function(on){ if(on && window.tapTempo) window.tapTempo(); };
  window.DJ_HANDLERS['cueset'] = function(on){ if(on){ window._cue = (window.currentPos?currentPos():0); if(window.toast) toast('Cue set @ '+ (window._cue||0).toFixed(2)); } };
  window.DJ_HANDLERS['cuejump'] = function(on){ if(on && typeof window.seekTo==='function') seekTo(window._cue||0); };
  window.DJ_HANDLERS['loopin'] = function(on){ if(on){ var v=document.getElementById('loopStart'); if(v) v.value=(window.currentPos?currentPos():0).toFixed(2); } };
  window.DJ_HANDLERS['loopout'] = function(on){ if(on){ var v=document.getElementById('loopEnd'); if(v) v.value=(window.currentPos?currentPos():0).toFixed(2); } };
  window.DJ_HANDLERS['reloop'] = function(on){ if(on){ var b=document.getElementById('btnLoop'); if(b) b.click(); } };
  window.DJ_HANDLERS['slipmode'] = function(on){ window._slip = on; if(window.toast) toast('Slip mode '+(on?'ON':'OFF')); };
  window.DJ_HANDLERS['fadein'] = function(on){ if(on && window.autoFadeIn) window.autoFadeIn(); };
  window.DJ_HANDLERS['fadeout'] = function(on){ if(on && window.autoFadeOut) window.autoFadeOut(); };
  window.DJ_HANDLERS['mono'] = function(on){ if(window.LIVE) window.LIVE.master.gain.gain.value = on? (window.LIVE.master.gain.gain.value) : window.LIVE.master.gain.gain.value; if(window.toast) toast('Mono '+(on?'ON':'OFF')); };
  window.DJ_HANDLERS['exportcue'] = function(on){ if(on && window.exportMix) window.exportMix(); };
  function buildDJPanel(){
    var panel = document.getElementById('djPanel');
    if(!panel) return;
    var html = '';
    SETS.forEach(function(s){
      html += '<div class="dj-set"><div class="dj-set-title">'+s.icon+' '+s.name+'</div><div class="dj-tools">';
      s.tools.forEach(function(t){
        html += '<button class="mini dj-tool" data-dj="'+t.id+'" title="'+t.desc+'">'+t.icon+' '+t.name+'</button>';
      });
      html += '</div></div>';
    });
    panel.innerHTML = '<div class="dj-grid">'+html+'</div>';
    panel.querySelectorAll('[data-dj]').forEach(function(b){
      b.addEventListener('click', function(){ window.djToggle(b.dataset.dj); });
    });
  }
  window.buildDJPanel = buildDJPanel;
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', buildDJPanel); } else { setTimeout(buildDJPanel,0); }
})();
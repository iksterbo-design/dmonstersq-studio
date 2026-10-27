/* D MONSTERS Q STUDIO — compatibility layer for Motorola & older phones.
   Loaded before the app. Adds polyfills, feature detection, and a low-perf
   mode for constrained devices (older Android WebView, low RAM, no AudioWorklet). */
(function(){
  'use strict';
  const ua = (navigator.userAgent||'').toLowerCase();
  const isMotorola = ua.indexOf('motorola') !== -1 || ua.indexOf('moto ') !== -1 ||
                     ua.indexOf('moto-') !== -1 || /moto[a-z0-9]/.test(ua);
  const isAndroid = ua.indexOf('android') !== -1;
  const isOldChrome = (function(){ const m = ua.match(/chrome\/(\d+)/); return m ? +m[1] < 70 : false; })();
  const isOldSafari = /safari/.test(ua) && !/chrome/.test(ua) && /version\/([0-9]+)/.test(ua) &&
                      +((ua.match(/version\/([0-9]+)/)||[])[1]||0) < 13;
  const lowMem = (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
                 (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
  const lowPerf = isMotorola || isOldChrome || isOldSafari || lowMem;

  window.DMQ_COMPAT = { isMotorola, isAndroid, isOldChrome, isOldSafari, lowMem, lowPerf };

  // Polyfills
  if(!window.AudioContext && window.webkitAudioContext) window.AudioContext = window.webkitAudioContext;
  if(!window.OfflineAudioContext && window.webkitOfflineAudioContext) window.OfflineAudioContext = window.webkitOfflineAudioContext;
  if(!Array.prototype.includes){ Array.prototype.includes = function(v){ return this.indexOf(v) !== -1; }; }
  if(!Object.assign){ Object.assign = function(t){ for(var i=1;i<arguments.length;i++){ var s=arguments[i]; if(s) for(var k in s) if(Object.prototype.hasOwnProperty.call(s,k)) t[k]=s[k]; } return t; }; }
  if(!window.requestAnimationFrame){ window.requestAnimationFrame = function(cb){ return setTimeout(function(){ cb(Date.now()); }, 16); }; }
  if(!window.cancelAnimationFrame){ window.cancelAnimationFrame = function(id){ clearTimeout(id); }; }
  if(!String.prototype.startsWith){ String.prototype.startsWith = function(p){ return this.slice(0,p.length)===p; }; }
  if(!window.fetch){ /* minimal fetch shim via XHR */ window.fetch = function(url,opts){ return new Promise(function(res,rej){ var x=new XMLHttpRequest(); x.open((opts&&opts.method)||'GET',url,true); if(opts&&opts.headers) for(var h in opts.headers) x.setRequestHeader(h,opts.headers[h]); x.onload=function(){ res({ok:x.status>=200&&x.status<300,status:x.status,text:function(){return Promise.resolve(x.responseText);},json:function(){return Promise.resolve(JSON.parse(x.responseText));} }); }; x.onerror=function(){rej(new Error('network'));}; x.send(opts&&opts.body); }); }; }

  // Prevent pinch-zoom on older Android
  document.addEventListener('touchmove', function(e){ if(e.scale && e.scale !== 1) e.preventDefault(); }, {passive:false});

  // Inject responsive / touch-friendly CSS
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 640px){
      header{ gap:4px; padding:6px 8px; }
      .btn{ padding:5px 8px; font-size:11px; }
      .tbtn{ width:34px; height:34px; font-size:13px; }
      .grp input[type=range]{ width:60px; }
      .fx-grid{ grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); }
    }
    .motorola-mode body, .lowperf body { filter: none; }
    button, .btn, .mini, .tbtn { touch-action: manipulation; -webkit-tap-highlight-color: transparent; min-height: 32px; }
    input[type=range]{ touch-action: pan-x; }
  `;
  (document.head||document.documentElement).appendChild(style);

  if(lowPerf){
    document.documentElement.classList.add('lowperf');
    if(isMotorola) document.documentElement.classList.add('motorola-mode');
    // reduce default analyser cost later via flag
    window.DMQ_LOW_PERF = true;
  }

  // Expose helper to check AudioWorklet support safely
  window.dmqHasAudioWorklet = function(ctx){ try { return !!(ctx && ctx.audioWorklet && typeof ctx.audioWorklet.addModule === 'function'); } catch(e){ return false; } };

  console.log('[DMQ compat] Motorola:', isMotorola, 'lowPerf:', lowPerf, 'oldChrome:', isOldChrome);
})();

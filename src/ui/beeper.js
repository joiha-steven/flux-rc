// Web Audio beeps scheduled on the AudioContext clock, plus the clock the visuals read.
// Audio is optional: when it is missing, blocked or muted, every call still works, the clock falls
// back to performance.now(), and the visuals carry the rhythm on their own.

const TONES = {
  count: { hz: 440, ms: 120, gain: 0.25 },
  pulse: { hz: 1320, ms: 100, gain: 0.3 },
  final: { hz: 880, ms: 700, gain: 0.3 },
};
const RAMP_S = 0.005; // short fade in and out so beeps do not click

export function createBeeper() {
  let ctx = null;
  let failed = false;
  let live = []; // oscillators scheduled and not finished, so stop() can silence them

  /**
   * Create or resume the AudioContext. Call it inside a tap: iOS only allows sound from a gesture,
   * so the create and resume() calls happen synchronously here. The returned promise resolves to
   * true once audio runs, or false after timeoutMs (resume() can hang, e.g. on iOS after a call).
   */
  function unlock(timeoutMs = 500) {
    if (failed) return Promise.resolve(false);
    try {
      const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Ctx) { failed = true; console.warn('flux-rc: Web Audio is not available, beeps are off'); return Promise.resolve(false); }
      ctx ||= new Ctx();
      if (ctx.state === 'running') return Promise.resolve(true);
      const resumed = ctx.resume().then(audioRunning, (e) => { console.warn('flux-rc: audio resume refused', e); return false; });
      const timeout = new Promise((resolve) => setTimeout(() => resolve(audioRunning()), timeoutMs));
      return Promise.race([resumed, timeout]).then((ok) => {
        if (!ok) console.warn(`flux-rc: audio is ${ctx.state}, beeps are off for this run`);
        return ok;
      });
    } catch (error) {
      failed = true;
      console.warn('flux-rc: could not start audio, beeps are off', error);
      return Promise.resolve(false);
    }
  }

  const audioRunning = () => Boolean(ctx && ctx.state === 'running');

  /**
   * The delay between a sound being scheduled and being heard, in ms: 150-250 ms over Bluetooth.
   * Ignored when missing or out of a sane 0-500 ms range.
   */
  function outputLatencyMs() {
    const s = ctx?.outputLatency;
    return typeof s === 'number' && s >= 0 && s <= 0.5 ? s * 1000 : 0;
  }

  /**
   * A clock for one run, started now. elapsed() returns ms since start on the audio clock when
   * sound is on and audio runs, else on performance.now(). beep(kind, atMs) schedules a tone at that
   * time of the same clock, so beeps and flashes come from one timeline.
   * On the audio clock elapsed() is shifted back by the output latency: a beep scheduled at atMs is
   * heard outputLatency later, so the circle and the GIF start follow what the user hears.
   * onInterrupt(fn) calls fn if the audio clock stops (context suspended or interrupted), since
   * elapsed() would then freeze; it returns an unsubscribe function.
   * @param {{ sound: boolean, leadMs: number }} options leadMs: delay before time 0, so the first
   *   beep is not scheduled in the past.
   */
  function startClock({ sound, leadMs }) {
    const useAudio = sound && audioRunning();
    const latencyMs = useAudio ? outputLatencyMs() : 0;
    const audioZero = useAudio ? ctx.currentTime + leadMs / 1000 : 0;
    const perfZero = performance.now() + leadMs;
    const elapsed = useAudio ? () => (ctx.currentTime - audioZero) * 1000 - latencyMs : () => performance.now() - perfZero;
    function onInterrupt(fn) {
      if (!useAudio) return () => {};
      const audio = ctx;
      const check = () => { if (audio.state !== 'running') fn(audio.state); };
      audio.addEventListener('statechange', check);
      return () => audio.removeEventListener('statechange', check);
    }
    function beep(kind, atMs) {
      if (!useAudio) return;
      const tone = TONES[kind];
      try {
        const start = audioZero + atMs / 1000;
        const end = start + tone.ms / 1000;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = tone.hz;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(tone.gain, start + RAMP_S);
        gain.gain.setValueAtTime(tone.gain, end - RAMP_S);
        gain.gain.linearRampToValueAtTime(0, end);
        osc.connect(gain).connect(ctx.destination);
        osc.onended = () => { live = live.filter((o) => o !== osc); gain.disconnect(); };
        osc.start(start);
        osc.stop(end);
        live.push(osc);
      } catch (error) {
        console.warn('flux-rc: beep failed', error);
      }
    }
    return { elapsed, beep, onInterrupt, usesAudio: useAudio, latencyMs };
  }

  /** Silence every scheduled beep. */
  function stop() {
    for (const osc of live) {
      try { osc.onended = null; osc.stop(); osc.disconnect(); } catch (error) { console.warn('flux-rc: could not stop a beep', error); }
    }
    live = [];
  }

  return { unlock, startClock, stop, audioRunning };
}

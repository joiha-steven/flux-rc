// Single source of truth: the config object. Subscribers get (config, meta).
// meta.live = true while a slider is being dragged (sections must not rebuild their DOM).
export function createStore(initial) {
  let config = initial;
  const subs = [];
  const emit = (meta) => subs.forEach((fn) => fn(config, meta));
  return {
    get: () => config,
    subscribe(fn) { subs.push(fn); return () => { const at = subs.indexOf(fn); if (at >= 0) subs.splice(at, 1); }; },
    update(mutate, meta = {}) {
      const next = structuredClone(config);
      mutate(next);
      config = next;
      emit(meta);
    },
    replace(next, meta = {}) {
      config = next;
      emit(meta);
    },
  };
}

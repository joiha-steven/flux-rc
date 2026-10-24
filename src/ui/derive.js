// Everything computed from a config, memoised by config identity.
// The program mirrors buildProgram() from core, but its GIF is built only when something reads
// `program.gif` (Program screen, Download GIF); loop time and packet details need only the frames.
import { configToFields, checksum, encodeFrames, framesToGif, validateConfig } from '../core/index.js';
import { t } from './i18n.js';

const cache = new WeakMap();

function lazyProgram(config, issues) {
  const fields = configToFields(config);
  const frames = encodeFrames(fields);
  let gif = null;
  return {
    fields,
    checksum: checksum(fields),
    frames,
    get gif() { gif ||= framesToGif(frames); return gif; },
    durationMs: frames.reduce((sum, f) => sum + f.cs, 0) * 10,
    issues,
  };
}

export function derive(config) {
  if (cache.has(config)) return cache.get(config);
  let program = null;
  let issues = [];
  try {
    issues = validateConfig(config);
    program = lazyProgram(config, issues);
  } catch (error) {
    console.error('flux-rc: could not build the program', error);
    issues = [{ severity: 'error', code: 'internal', message: t('issue.internal'), path: '' }];
  }
  const errors = issues.filter((i) => i.severity === 'error');
  const result = { program, issues, errors, canProgram: Boolean(program) && errors.length === 0 };
  cache.set(config, result);
  return result;
}

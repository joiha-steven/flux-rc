import { configToFields } from './fields.js';
import { checksum, encodeFrames } from './protocol.js';
import { framesToGif } from './gif.js';
import { validateConfig } from './validate.js';

/**
 * Everything needed to show and describe a program. Builds even when validation finds errors;
 * the caller decides whether to allow programming.
 * @param {object} config a normalised config
 */
export function buildProgram(config) {
  const fields = configToFields(config);
  const frames = encodeFrames(fields);
  return {
    fields,
    checksum: checksum(fields),
    frames,
    gif: framesToGif(frames),
    durationMs: frames.reduce((sum, f) => sum + f.cs, 0) * 10,
    issues: validateConfig(config),
  };
}

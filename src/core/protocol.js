// Fields -> animation frames. See docs/protocol.md sections 1 and 2.
// Durations are in centiseconds (the native unit of GIF frame delays).

export const DURATION = { LEAD: 300, RESET: 34, ZERO: 4, ONE: 14, NULL: 24, OFF: 10, GAP: 30 };
export const HEADER = 151;
export const FIELD_WIDTHS = [6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 7, 6, 6, 8, 8];

/** Thrown when fields cannot be encoded (wrong count or a value that does not fit its width). */
export class ProtocolError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProtocolError';
  }
}

/**
 * Packet checksum: sum of all non-null field values, modulo 255.
 * @param {(number|null)[]} fields
 * @returns {number}
 */
export function checksum(fields) {
  return fields.reduce((sum, v) => sum + (v === null ? 0 : v), 0) % 255;
}

function checkFields(fields) {
  if (!Array.isArray(fields) || fields.length !== FIELD_WIDTHS.length) {
    throw new ProtocolError(`Expected ${FIELD_WIDTHS.length} fields, got ${Array.isArray(fields) ? fields.length : typeof fields}`);
  }
  fields.forEach((v, i) => {
    if (v === null) return;
    const max = 2 ** FIELD_WIDTHS[i] - 1;
    if (!Number.isInteger(v) || v < 0 || v > max) {
      throw new ProtocolError(`Field ${i} must be an integer from 0 to ${max} (${FIELD_WIDTHS[i]} bits), got ${v}`);
    }
  });
}

/**
 * Frames of one packet.
 * @param {(number|null)[]} fields 15 values, null = leave unchanged
 * @returns {{ color: 'lead'|'white'|'black', cs: number }[]}
 * @throws {ProtocolError} if a value does not fit its field width
 */
export function encodeFrames(fields) {
  checkFields(fields);
  const frames = [];
  const push = (color, cs) => frames.push({ color, cs });
  const bits = (value, width) => {
    for (let b = width - 1; b >= 0; b--) {
      push('white', (value >> b) & 1 ? DURATION.ONE : DURATION.ZERO);
      push('black', DURATION.OFF);
    }
  };

  push('lead', DURATION.LEAD);
  push('white', DURATION.RESET);
  push('black', DURATION.GAP);
  bits(HEADER, 8);
  push('black', DURATION.GAP);
  fields.forEach((v, i) => {
    if (v === null) {
      push('white', DURATION.NULL);
      push('black', DURATION.OFF);
    } else {
      bits(v, FIELD_WIDTHS[i]);
    }
  });
  bits(checksum(fields), 8);
  return frames;
}

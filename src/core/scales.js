// Conversions between raw field values and the numbers shown to people.
// See docs/protocol.md section 7.

/** Known thermal points: [field value, degrees Celsius]. */
const THERMAL_POINTS = [[2, 30], [5, 40], [9, 50], [13, 60], [19, 70], [28, 80], [39, 90], [54, 100]];

/** Mode switch timeout in seconds (about 32 ms per step), rounded to 0.1 s. */
function timeoutSeconds(v) {
  return Math.round(v * 0.032 * 10) / 10;
}

/**
 * Thermal cutoff in °C for a field value. Piecewise linear between the known points; outside them
 * the nearest segment is extended (so 55-60 exceed 100 °C).
 * @param {number} v field value, 1-60
 */
function thermalCelsius(v) {
  const last = THERMAL_POINTS.length - 1;
  let i = 0;
  while (i < last - 1 && v > THERMAL_POINTS[i + 1][0]) i++;
  const [x0, y0] = THERMAL_POINTS[i];
  const [x1, y1] = THERMAL_POINTS[i + 1];
  return y0 + ((v - x0) * (y1 - y0)) / (x1 - x0);
}

/**
 * Inverse of thermalCelsius: the field value whose temperature is closest to `c`, clamped 1-60.
 * @param {number} c degrees Celsius
 */
function thermalFieldForCelsius(c) {
  let best = 1;
  let bestDiff = Infinity;
  for (let v = 1; v <= 60; v++) {
    const diff = Math.abs(thermalCelsius(v) - c);
    if (diff < bestDiff) {
      best = v;
      bestDiff = diff;
    }
  }
  return best;
}

/** @param {number} c degrees Celsius */
function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

/** Highest allowed brightness level for a limit field value (for the dual limit, 32 = afterburning). */
function limitLevel(v) {
  return v + 1;
}

/** Bounce (tap) sensor sensitivity shown to people, about 50-100. */
function bounceSensitivity(v) {
  return 49.2 + v / 5;
}

/**
 * PIN field value from three digits (d1 1-4, d2 1-8, d3 1-8).
 * @param {number[]} digits
 */
function pinField(digits) {
  const [d1, d2, d3] = digits;
  return (d1 - 1) * 64 + (d2 - 1) * 8 + (d3 - 1);
}

export const scales = {
  timeoutSeconds,
  thermalCelsius,
  thermalFieldForCelsius,
  celsiusToFahrenheit,
  limitLevel,
  bounceSensitivity,
  pinField,
};

export {
  timeoutSeconds,
  thermalCelsius,
  thermalFieldForCelsius,
  celsiusToFahrenheit,
  limitLevel,
  bounceSensitivity,
  pinField,
};

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { configToFields, encodeFrames, framesToGif, parseSource } from '../src/core/index.js';
import { PRESETS } from '../src/data/presets.js';

const dir = new URL('./fixtures/', import.meta.url);
const data = JSON.parse(readFileSync(new URL('samples.json', dir), 'utf8'));

for (const sample of data.samples) {
  test(`sample "${sample.name}": fields encode to the recorded GIF byte for byte`, () => {
    const gif = framesToGif(encodeFrames(sample.fields));
    assert.deepEqual(Buffer.from(gif), readFileSync(new URL(sample.gif, dir)));
  });
  test(`sample "${sample.name}": source parses to the recorded fields`, () => {
    assert.deepEqual(configToFields(parseSource(sample.source)), sample.fields);
  });
}

for (const exp of data.experiments) {
  test(`experiment "${exp.name}"`, () => {
    const values = data.experimentBase.split(',');
    for (const [i, v] of Object.entries(exp.overrides)) values[Number(i)] = v;
    const fields = configToFields(parseSource(values.join(',')));
    assert.deepEqual(fields, exp.fields);
    assert.equal(encodeFrames(fields).length > 0, true);
  });
}

test('every preset parses and encodes to its sample fields', () => {
  assert.equal(PRESETS.length, 9);
  for (const preset of PRESETS) {
    const sample = data.samples.find((s) => s.source === preset.source);
    assert.ok(sample, `preset ${preset.id} has a matching sample`);
    assert.deepEqual(configToFields(parseSource(preset.source)), sample.fields, preset.id);
    assert.ok(preset.name && preset.description && preset.id);
  }
});

#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { readFileSync } from 'node:fs';
import { hex, loadAnchors, parseArgs, parseInteger, requireFile } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.before || !args.after) throw new Error('Provide --before and --after RAM dump files');
const beforePath = requireFile(args.before, 'Before snapshot');
const afterPath = requireFile(args.after, 'After snapshot');
const before = readFileSync(beforePath);
const after = readFileSync(afterPath);
if (before.length !== after.length) throw new Error('Snapshots must have equal lengths');

const inferredBase = before.length === 0x8000 ? 0x03000000 : before.length === 0x40000 ? 0x02000000 : null;
const base = args.base !== undefined ? parseInteger(args.base, 'base') : inferredBase;
if (base === null) throw new Error('Cannot infer RAM base; provide --base 0x02000000 or --base 0x03000000');
const mergeGap = parseInteger(args['merge-gap'] ?? '4', 'merge-gap');
const context = parseInteger(args.context ?? '4', 'context');

const changed = [];
for (let i = 0; i < before.length; i++) if (before[i] !== after[i]) changed.push(i);
const spans = [];
for (const offset of changed) {
  const last = spans.at(-1);
  if (!last || offset - last.end > mergeGap + 1) spans.push({ start: offset, end: offset });
  else last.end = offset;
}

const anchors = loadAnchors().anchors
  .filter(anchor => anchor.kind.endsWith('ram'))
  .map(anchor => ({ ...anchor, numericAddress: Number.parseInt(anchor.address, 16) }))
  .filter(anchor => anchor.numericAddress >= base && anchor.numericAddress < base + before.length);

const resultSpans = spans.map(span => {
  const from = Math.max(0, span.start - context);
  const to = Math.min(before.length, span.end + context + 1);
  return {
    start: hex(base + span.start),
    end: hex(base + span.end),
    length: span.end - span.start + 1,
    before: before.subarray(from, to).toString('hex'),
    after: after.subarray(from, to).toString('hex'),
    anchors: anchors
      .filter(anchor => anchor.numericAddress >= base + from && anchor.numericAddress < base + to)
      .map(anchor => anchor.name),
  };
});

console.log(JSON.stringify({
  before: beforePath,
  after: afterPath,
  base: hex(base),
  size: before.length,
  changedBytes: changed.length,
  spans: resultSpans,
}, null, 2));


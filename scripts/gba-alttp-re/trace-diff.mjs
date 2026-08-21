#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { readFileSync } from 'node:fs';
import { hex, parseArgs, parseInteger, requireFile } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.baseline || !args.target) throw new Error('Provide --baseline and --target trace files');
const baselinePath = requireFile(args.baseline, 'Baseline trace');
const targetPath = requireFile(args.target, 'Target trace');
const limit = parseInteger(args.limit ?? '100', 'limit');
const minDelta = parseInteger(args['min-delta'] ?? '1', 'min-delta');

const countRomPcs = (path) => {
  const counts = new Map();
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const matches = line.match(/\b(?:0x)?(0[89][0-9a-f]{6})\b/ig) ?? [];
    if (matches.length === 0) continue;
    const pc = Number.parseInt(matches[0].replace(/^0x/i, ''), 16);
    counts.set(pc, (counts.get(pc) ?? 0) + 1);
  }
  return { counts, lineCount: lines.length };
};

const baseline = countRomPcs(baselinePath);
const target = countRomPcs(targetPath);
const differences = [];
for (const [pc, targetCount] of target.counts) {
  const baselineCount = baseline.counts.get(pc) ?? 0;
  const delta = targetCount - baselineCount;
  if (delta >= minDelta) differences.push({ pc: hex(pc), targetCount, baselineCount, delta });
}
differences.sort((a, b) => b.delta - a.delta || b.targetCount - a.targetCount || a.pc.localeCompare(b.pc));

console.log(JSON.stringify({
  baseline: { path: baselinePath, lines: baseline.lineCount, uniqueRomPcs: baseline.counts.size },
  target: { path: targetPath, lines: target.lineCount, uniqueRomPcs: target.counts.size },
  differences: differences.slice(0, limit),
}, null, 2));


/* @layer tooling-scripts @kind logic */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'node:child_process';
import { walkFiles } from './walk.mjs';
import { loadManifest } from './manifest.mjs';
import { classifyFile } from './classify.mjs';
import { writeTags } from './tag-writer.mjs';
import { buildReport, printReport } from './aggregate.mjs';
import { sh } from './adapters/_run.mjs';
import { adapter as linePolicy } from './adapters/line-policy.mjs';
import { adapter as deadCssVar } from './adapters/dead-css-var.mjs';

const ADAPTERS = [linePolicy, deadCssVar];
const ROOT = process.cwd();
const REPORT_PATH = 'tooling/analyze/report.json';
const args = new Set(process.argv.slice(2));

const gitChanged = () => {
  const cmds = ['git diff --name-only HEAD', 'git diff --name-only --cached', 'git ls-files --others --exclude-standard'];
  const set = new Set();
  for (const c of cmds) for (const l of sh(c, ROOT).stdout.split('\n')) { const t = l.trim(); if (t) set.add(t.replace(/\\/g, '/')); }
  return set;
};

const classifyAll = (rels, manifest) => rels.map((rel) => classifyFile(ROOT, rel, manifest));

const selectFiles = (mode) => {
  const visible = new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: ROOT })
    .toString('utf8').split('\0').filter(Boolean).map((rel) => rel.replace(/\\/g, '/')));
  const rels = walkFiles(ROOT).filter((rel) => visible.has(rel));
  if (mode !== 'diff') return rels;
  const changed = gitChanged();
  return rels.filter((r) => changed.has(r));
};

const classifyWithTags = (rels, manifest) => {
  const records = classifyAll(rels, manifest);
  if (!args.has('--fix-tags')) return records;
  const { written, skipped } = writeTags(ROOT, records);
  console.log(`--fix-tags: wrote ${written} headers, skipped ${skipped}`);
  return classifyAll(rels, manifest);
};

const runAdapters = async (records, ctx, changedSet) => {
  const findings = [];
  for (const a of ADAPTERS) {
    const subset = records.filter((r) => a.appliesTo(r));
    const raw = await a.run(subset, ctx);
    for (const f of raw) if (ctx.mode === 'full' || changedSet.has(f.path)) findings.push(f);
  }
  return findings;
};

const main = async () => {
  const manifest = loadManifest(ROOT);
  const mode = args.has('--diff') ? 'diff' : 'full';
  const rels = selectFiles(mode);
  const records = classifyWithTags(rels, manifest);
  const findings = await runAdapters(records, { root: ROOT, mode }, new Set(rels));

  const report = buildReport(records, findings, new Date(0).toISOString());
  printReport(report);
  if (args.has('--json')) {
    fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2));
    console.log(`\nFull report -> ${REPORT_PATH}`);
  }
  if (args.has('--ci') && report.violations.length) process.exit(1);
};

main();

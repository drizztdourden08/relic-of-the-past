/* @layer tooling-scripts @kind logic */
// Read-only: does .claude/ (or CLAUDE.md, tools, etc.) differ from what ai-config
// last rendered? .ai-config.json records every rendered file's hash; no network.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const MANIFEST = join(ROOT, '.ai-config.json');

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

/** @returns {{ status: 'unmanaged'|'clean'|'drift', edits: string[] }} */
const checkAiConfig = () => {
  if (!existsSync(MANIFEST)) return { status: 'unmanaged', edits: [] };

  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const edits = manifest.files
    .filter((f) => !existsSync(join(ROOT, f.path)) || sha256(join(ROOT, f.path)) !== f.sha256)
    .map((f) => f.path);

  return { status: edits.length ? 'drift' : 'clean', edits };
};

export { checkAiConfig };

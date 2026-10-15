/* @layer tooling-scripts @kind logic */
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..', '..');

export { repoRoot };

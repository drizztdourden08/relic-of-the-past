/* @layer tooling-scripts @kind logic */
import { readFileSync } from 'node:fs';

const TOOL_PATHS = JSON.parse(readFileSync(new URL('./tool-paths.json', import.meta.url), 'utf8'));

export { TOOL_PATHS };

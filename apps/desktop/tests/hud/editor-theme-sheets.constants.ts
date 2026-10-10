/* @layer tests @kind constants */
import { readFileSync } from 'node:fs';
import { REPO_ROOT } from '../repo-root';

const DIR = `${REPO_ROOT}/apps/desktop/src/theme/hud-layout-editor`;

const EDITOR_THEME_SHEETS: readonly string[] = [
  ...readFileSync(`${DIR}/hud-layout-editor.css`, 'utf8').matchAll(/@import url\('\.\/([\w-]+\.css)'\)/g),
].map((match) => `${DIR}/${match[1] ?? ''}`);

export { EDITOR_THEME_SHEETS };

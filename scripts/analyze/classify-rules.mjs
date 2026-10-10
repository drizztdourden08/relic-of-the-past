/* @layer tooling-scripts @kind logic */
import { TOOL_PATHS } from '../tool-paths.mjs';

const BINARY_EXT = new Set(['wav', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'sfc', 'dat', 'bin', 'ttf', 'woff', 'woff2', 'zip', 'exe', 'icns']);

const LANG_BY_EXT = {
  ts: 'TypeScript', tsx: 'TypeScript-React',
  js: 'JavaScript', cjs: 'JavaScript', mjs: 'JavaScript', jsx: 'JavaScript-React',
  c: 'C', h: 'C-Header', cpp: 'C++', hpp: 'C++',
  json: 'JSON', md: 'Markdown', css: 'CSS', scss: 'SCSS', html: 'HTML',
  bat: 'Batch', sh: 'Shell', ps1: 'PowerShell', py: 'Python',
  yml: 'YAML', yaml: 'YAML', toml: 'TOML',
};

const ROLE_RULES = [
  ['core/zelda3/', 'core-zelda3'],
  ['core/game-hooks/', 'core-game-hooks'],
  ['core/wasm-build/', 'core-wasm-build'],
  ['core/', 'core-other'],
  ['apps/desktop/electron/', 'electron-main'],
  ['apps/desktop/src/game/', 'bridge-wasm'],
  ['apps/desktop/src/stores/', 'renderer-stores'],
  ['apps/desktop/src/widgets/', 'renderer-widgets'],
  ['apps/desktop/src/hud/', 'renderer-hud'],
  ['apps/desktop/src/compounds/', 'renderer-components'],
  ['apps/desktop/src/views/', 'renderer-components'],
  ['apps/desktop/src/', 'renderer-other'],
  ['apps/desktop/public/', 'renderer-public'],
  ['apps/sanctuary/', 'sanctuary-site'],
  ['apps/store/', 'store-site'],
  ['apps/sanctuary-api/', 'sanctuary-api'],
  ['apps/store-api/', 'store-api'],
  ['packages/hub-contracts/src/ports/', 'shared-config'],
  ['packages/hub-contracts/src/hub/', 'shared-hub'],
  ['packages/hub-contracts/src/sanctuary/', 'shared-sanctuary'],
  ['packages/hub-contracts/src/store/', 'shared-store'],
  ['packages/hub-server/', 'hub-core'],
  ['packages/hub-client/', 'site-kit'],
  ['packages/design/', 'design'],
  ['packages/asset-extraction/', 'shared-asset-extraction'],
  ['packages/game-data/', 'shared-game'],
  ['packages/input-mapping/', 'shared-input'],
  ['packages/', 'packages'],
  ['scripts/', 'tooling-scripts'],
  ['tests/', 'tests'],
  ['docs/', 'docs'],
  [`${TOOL_PATHS.toolFolder}/`, TOOL_PATHS.toolRole],
];

const DATA_PATH_HINTS = [
  'packages/game-data/src/data/',
  'packages/input-mapping/src/presets/',
  'packages/input-mapping/src/device-database',
  'packages/asset-extraction/src/text/data/language-data',
  'packages/input-mapping/src/haptic-patterns',
  '/data/button-icons',
  'InputTester/data/',
];

const extOf = (p) => { const m = p.toLowerCase().match(/\.([a-z0-9]+)$/); return m ? m[1] : ''; };

const baseName = (p) => p.split('/').pop() ?? p;

const classifyLang = (p) => {
  if (baseName(p) === 'Makefile') return 'Make';
  const e = extOf(p);
  if (BINARY_EXT.has(e)) return 'Binary';
  return LANG_BY_EXT[e] ?? 'Other';
};

const classifyRole = (p) => {
  for (const [prefix, role] of ROLE_RULES) if (p.startsWith(prefix)) return role;
  return 'root-config';
};

const TYPE_BY_LANG = {
  Binary: 'asset',
  Markdown: 'doc',
  CSS: 'style',
  SCSS: 'style',
  JSON: 'config-data',
  Make: 'build',
  Batch: 'build',
  Shell: 'build',
  PowerShell: 'build',
  YAML: 'build',
  TOML: 'build',
  C: 'native',
  'C-Header': 'native',
  'C++': 'native',
};

const LOGIC_LINE = /(=>|\bfunction\b|\bif\s*\(|\bfor\s*\(|\bwhile\s*\(|\bswitch\s*\(|\breturn\b|\bawait\b|\.map\(|\.filter\(|\.forEach\(|\.reduce\(|useState|useEffect|useCallback)/;

const typeFromPathAndHead = (p, base, head) => {
  if (/\.(test|spec)\.[tj]sx?$/.test(p)) return 'test';
  if (/auto-?generated|do not edit/i.test(head)) return 'generated';
  if (/\.(config|d)\.[tj]s$/.test(base) || /config/i.test(base)) return 'config';
  return null;
};

const isDataFile = (p, content, codeLines) => {
  if (DATA_PATH_HINTS.some((h) => p.includes(h))) return true;
  const logic = codeLines.filter((l) => LOGIC_LINE.test(l)).length;
  const dataScore = codeLines.length ? 1 - logic / codeLines.length : 0;
  const hasLiteral = /=\s*[[{]|:\s*[A-Za-z0-9_<>[\]]+\s*=\s*\[/.test(content);
  return hasLiteral && dataScore > 0.9 && codeLines.length > 40;
};

const typeFromContent = (p, base, content) => {
  const codeLines = content.split('\n').filter((l) => l.trim() && !/^\s*(\/\/|\*|\/\*|\*\/)/.test(l));
  const isBarrel = base === 'index.ts' && codeLines.length > 0 && codeLines.every((l) => /^\s*(export|import)\b/.test(l));
  if (isBarrel) return 'barrel';
  if (isDataFile(p, content, codeLines)) return 'data';
  return null;
};

const typeFromName = (lang, base) => {
  if (lang === 'TypeScript-React') return 'component';
  if (/^use[A-Z]/.test(base)) return 'hook';
  if (base === 'types.ts' || /^[A-Z].*\.types\.ts$/.test(base)) return 'types';
  if (base === 'constants.ts') return 'constants';
  if (base === 'styles.ts') return 'style';
  return 'logic';
};

const classifyType = (p, content) => {
  const lang = classifyLang(p);
  const head = content.slice(0, 1200);
  const tag = head.match(/@kind\s+([a-z-]+)/i);
  if (tag) return { type: tag[1].toLowerCase(), source: 'tag' };

  const base = baseName(p);
  const type = TYPE_BY_LANG[lang]
    ?? typeFromPathAndHead(p, base, head)
    ?? typeFromContent(p, base, content)
    ?? typeFromName(lang, base);
  return { type, source: 'heuristic' };
};

const readLayerTag = (content) => {
  const m = content.slice(0, 1200).match(/@layer\s+([a-z-]+)/i);
  return m ? m[1].toLowerCase() : null;
};

export { classifyLang, classifyRole, classifyType, readLayerTag, baseName };

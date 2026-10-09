/* @layer tooling-scripts @kind logic */

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
  ['apps/desktop/src/tokens/', 'renderer-design-system'],
  ['apps/desktop/fonts/', 'renderer-design-system'],
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
  ['.claude/', 'claude-config'],
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

const classifyType = (p, content) => {
  const lang = classifyLang(p);
  const head = content.slice(0, 1200);
  const tag = head.match(/@kind\s+([a-z-]+)/i);
  if (tag) return { type: tag[1].toLowerCase(), source: 'tag' };

  const base = baseName(p);
  if (lang === 'Binary') return { type: 'asset', source: 'heuristic' };
  if (lang === 'Markdown') return { type: 'doc', source: 'heuristic' };
  if (lang === 'CSS' || lang === 'SCSS') return { type: 'style', source: 'heuristic' };
  if (lang === 'JSON') return { type: 'config-data', source: 'heuristic' };
  if (['Make', 'Batch', 'Shell', 'PowerShell', 'YAML', 'TOML'].includes(lang)) return { type: 'build', source: 'heuristic' };
  if (lang === 'C' || lang === 'C-Header' || lang === 'C++') return { type: 'native', source: 'heuristic' };
  if (/\.(test|spec)\.[tj]sx?$/.test(p)) return { type: 'test', source: 'heuristic' };
  if (/auto-?generated|do not edit/i.test(head)) return { type: 'generated', source: 'heuristic' };
  if (/\.(config|d)\.[tj]s$/.test(base) || /config/i.test(base)) return { type: 'config', source: 'heuristic' };

  const lines = content.split('\n');
  const codeLines = lines.filter((l) => l.trim() && !/^\s*(\/\/|\*|\/\*|\*\/)/.test(l));
  const isBarrel = base === 'index.ts' && codeLines.length > 0 && codeLines.every((l) => /^\s*(export|import)\b/.test(l));
  if (isBarrel) return { type: 'barrel', source: 'heuristic' };

  const logic = codeLines.filter((l) => /(=>|\bfunction\b|\bif\s*\(|\bfor\s*\(|\bwhile\s*\(|\bswitch\s*\(|\breturn\b|\bawait\b|\.map\(|\.filter\(|\.forEach\(|\.reduce\(|useState|useEffect|useCallback)/.test(l)).length;
  const dataScore = codeLines.length ? 1 - logic / codeLines.length : 0;
  const hasLiteral = /=\s*[[{]|:\s*[A-Za-z0-9_<>[\]]+\s*=\s*\[/.test(content);
  const pathData = DATA_PATH_HINTS.some((h) => p.includes(h));
  if (pathData || (hasLiteral && dataScore > 0.9 && codeLines.length > 40)) return { type: 'data', source: 'heuristic' };

  if (lang === 'TypeScript-React') return { type: 'component', source: 'heuristic' };
  if (/^use[A-Z]/.test(base)) return { type: 'hook', source: 'heuristic' };
  if (base === 'types.ts' || /^[A-Z].*\.types\.ts$/.test(base)) return { type: 'types', source: 'heuristic' };
  if (base === 'constants.ts') return { type: 'constants', source: 'heuristic' };
  if (base === 'styles.ts') return { type: 'style', source: 'heuristic' };
  return { type: 'logic', source: 'heuristic' };
};

const readLayerTag = (content) => {
  const m = content.slice(0, 1200).match(/@layer\s+([a-z-]+)/i);
  return m ? m[1].toLowerCase() : null;
};

export { classifyLang, classifyRole, classifyType, readLayerTag, baseName };

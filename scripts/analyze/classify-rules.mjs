/* @layer tooling-scripts @kind logic */
/**
 * Classification rules: language (by extension), architectural role (by path),
 * and file type (by path + content heuristics). Tags in a file header, when
 * present, are authoritative and override the heuristics — see classifyType().
 *
 * Tag convention (proposed): a header line `@layer <role>` and `@kind <type>`.
 */

const BINARY_EXT = new Set(['wav', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'sfc', 'dat', 'bin', 'ttf', 'woff', 'woff2', 'zip', 'exe', 'icns']);

const LANG_BY_EXT = {
  ts: 'TypeScript', tsx: 'TypeScript-React',
  js: 'JavaScript', cjs: 'JavaScript', mjs: 'JavaScript', jsx: 'JavaScript-React',
  c: 'C', h: 'C-Header', cpp: 'C++', hpp: 'C++',
  json: 'JSON', md: 'Markdown', css: 'CSS', scss: 'SCSS', html: 'HTML',
  bat: 'Batch', sh: 'Shell', ps1: 'PowerShell', py: 'Python',
  yml: 'YAML', yaml: 'YAML', toml: 'TOML',
};

// Ordered: first matching path prefix wins.
const ROLE_RULES = [
  ['core/zelda3/', 'core-zelda3'],
  ['core/game-hooks/', 'core-game-hooks'],
  ['core/wasm-build/', 'core-wasm-build'],
  ['core/', 'core-other'],
  ['apps/desktop/electron/', 'electron-main'],
  ['apps/web/src/lib/game/', 'bridge-wasm'],
  ['apps/web/src/lib/', 'renderer-lib'],
  ['apps/web/src/stores/', 'renderer-stores'],
  ['apps/web/src/widgets/', 'renderer-widgets'],
  ['apps/web/src/hud/', 'renderer-hud'],
  ['apps/web/src/design-system/', 'renderer-design-system'],
  ['apps/web/src/components/', 'renderer-components'],
  ['apps/web/src/App/', 'renderer-appshell'],
  ['apps/web/src/', 'renderer-other'],
  ['apps/web/public/', 'renderer-public'],
  ['shared/platform/', 'shared-platform'],
  ['shared/storage/', 'shared-storage'],
  ['shared/asset-extraction/', 'shared-asset-extraction'],
  ['shared/game/', 'shared-game'],
  ['shared/input/', 'shared-input'],
  ['shared/types/', 'shared-types'],
  ['shared/', 'shared-other'],
  ['scripts/', 'tooling-scripts'],
  ['tests/', 'tests'],
  ['docs/', 'docs'],
  ['.claude/', 'claude-config'],
];

// Paths whose TS/JS content is predominantly literal data tables.
const DATA_PATH_HINTS = [
  'shared/game/data/',
  'shared/input/presets/',
  'shared/input/device-database',
  'shared/asset-extraction/text/language-data',
  'shared/asset-extraction/extraction/tables-data',
  'shared/input/haptic-patterns',
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

// Returns { type, source } where source is 'tag' | 'heuristic'.
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

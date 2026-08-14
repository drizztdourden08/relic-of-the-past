/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Generates `shared/game/data/enumeration/generated-types.ts` from
 * `ALL_ENUMERATION` — one `export type <Name> = 'a' | 'b' | ...;` per category,
 * in the category's own seed order. This is the single editable source for the
 * 10 closed-set label unions (World, ScreenKind, ItemCategory, ...); the 6
 * `shared/game/data/types/*.ts` files that used to hand-write these just import
 * the generated union instead.
 *
 * `ALL_ENUMERATION` is imported directly from its `.ts` source — Node 24 strips
 * erasable TypeScript syntax natively, and the module has no runtime deps (its
 * only import is `import type`), so no ts-node / build step is needed here.
 *
 * Run with: `npm run generate:enum-types` (which runs `generate-enum-types-cli.mjs`,
 * the only file that ever invokes `generateEnumTypes` unprompted — see its own
 * header for why that trigger cannot live here).
 *
 * The repo root defaults to a path relative to THIS script's own file — correct
 * for the CLI, where the script always runs from its real, unbundled location.
 * The Electron writer that calls `generateEnumTypes` at runtime is a different
 * story: `enumeration-writer.ts` gets bundled into `dist/electron/main.js`, and
 * once that happens `import.meta.url` resolves to the BUNDLE's location, not
 * this file's original one — the same bundled code can land at a different
 * directory depth in dev, an electron-vite production build and a packaged
 * app. So `generateEnumTypes` takes an optional `root`; a caller that already
 * knows the real repo root (the writer does — every other writer receives one
 * the same way, see `workspace-root.ts`) passes it in and skips this guess
 * entirely, and only the CLI ever relies on the default.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.join(SCRIPT_DIR, '..');
const enumerationSourceFor = (root) => path.join(root, 'shared/game/data/records/enumeration/enumeration.ts');
const outputPathFor = (root) => path.join(root, 'shared/game/data/enumeration/generated-types.ts');

/** category → the exported type name every consuming file already expects. */
const CATEGORY_TYPE_NAMES = {
  world: 'World',
  'screen-kind': 'ScreenKind',
  'interior-kind': 'InteriorKind',
  'connection-kind': 'ConnectionKind',
  'connection-side': 'ConnectionSide',
  'actor-kind': 'ActorKind',
  'check-kind': 'CheckKind',
  'item-category': 'ItemCategory',
  'item-origin': 'ItemOrigin',
  'review-status': 'ReviewStatus',
};

const HEADER = `/* @layer shared-game @kind generated */
/**
 * GENERATED — do not hand-edit. Regenerate with \`npm run generate:enum-types\`
 * (scripts/generate-enum-types.mjs), which reads \`ALL_ENUMERATION\`
 * (../enumeration.ts) and emits one union type per category.
 */
`;

/** One `export type Name = 'a' | 'b';` line per category, in seed order, first-seen-wins for dupes. */
const buildGeneratedTypesSource = (allEnumeration) => {
  const valuesByCategory = new Map();
  for (const entry of allEnumeration) {
    const values = valuesByCategory.get(entry.category) ?? [];
    if (!values.includes(entry.value)) values.push(entry.value);
    valuesByCategory.set(entry.category, values);
  }

  const lines = Object.entries(CATEGORY_TYPE_NAMES).map(([category, typeName]) => {
    const values = valuesByCategory.get(category);
    if (!values || values.length === 0) {
      throw new Error(`generate-enum-types: no ALL_ENUMERATION rows found for category "${category}"`);
    }
    const union = values.map((v) => `'${v}'`).join(' | ');
    return `type ${typeName} = ${union};`;
  });

  const exportNames = Object.values(CATEGORY_TYPE_NAMES).sort();
  const chunkSize = 4;
  const chunks = [];
  for (let i = 0; i < exportNames.length; i += chunkSize) chunks.push(exportNames.slice(i, i + chunkSize));
  const exportBlock = `export type {\n${chunks.map((c) => `  ${c.join(', ')},`).join('\n')}\n};\n`;

  return `${HEADER}\n${lines.join('\n')}\n\n${exportBlock}`;
};

/**
 * A cache-busting query string on every import — the CLI only ever imports
 * once, but the Electron writer calls this repeatedly for the life of the
 * process, and Node's ESM loader otherwise caches the first read forever.
 */
const loadAllEnumeration = async (enumerationSource) => {
  const mod = await import(`${pathToFileURL(enumerationSource).href}?t=${Date.now()}`);
  return mod.ALL_ENUMERATION;
};

/**
 * The core generation step — reads the real data, writes the generated file.
 * Reused by callers other than the CLI (e.g. the Data Inspector's write path),
 * which pass their own already-correct repo root rather than this file's guess.
 */
const generateEnumTypes = async (root = DEFAULT_ROOT) => {
  const allEnumeration = await loadAllEnumeration(enumerationSourceFor(root));
  const source = buildGeneratedTypesSource(allEnumeration);
  const outputPath = outputPathFor(root);
  writeFileSync(outputPath, source);
  return outputPath;
};

// No self-invoking "am I the CLI entry point" check here on purpose — this
// module is imported into `enumeration-writer.ts`, which gets bundled into
// `dist/electron/main.js`. A `process.argv[1] === import.meta.url` check would
// have been true there too: launching `electron dist/electron/main.js` makes
// `argv[1]` literally that same bundled file, which is also this code's own
// `import.meta.url` once bundling has folded it in. That check DID live here
// once, and it fired on every single app launch as a result — silently
// running the CLI path with no caller-supplied root, which is exactly the
// wrong-directory guess that crashed every production build
// (`ERR_MODULE_NOT_FOUND` for `dist/shared/.../enumeration.ts`). The fix is
// structural, not a smarter check: nothing in this file may ever call itself.
// `generate-enum-types-cli.mjs` is the one place that does, and it is never
// imported by anything else, so it can never end up bundled next to a
// different real entry point.
export { buildGeneratedTypesSource, generateEnumTypes };

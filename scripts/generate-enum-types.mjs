/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Generates `shared/game/data/enumeration/generated-types.ts` from `ALL_ENUMERATION`:
 * one `export type <Name> = 'a' | 'b' | ...;` per category, in seed order. The
 * `.ts` source is imported directly (Node 24 strips erasable TypeScript; the module
 * has no runtime deps). Run with `npm run generate:enum-types`, which invokes
 * `generate-enum-types-cli.mjs`.
 *
 * The default repo root is relative to this file, which is only right for the CLI.
 * `enumeration-writer.ts` is bundled into `dist/electron/main.js`, where
 * `import.meta.url` resolves to the bundle at a directory depth that differs
 * between dev, production build and packaged app, so it passes the real `root`
 * (see `workspace-root.ts`).
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
 * GENERATED FILE. Do not hand-edit. Regenerate with \`npm run generate:enum-types\`
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

// Cache-busting query: the Electron writer calls this repeatedly, and Node's ESM
// loader otherwise caches the first read forever.
const loadAllEnumeration = async (enumerationSource) => {
  const mod = await import(`${pathToFileURL(enumerationSource).href}?t=${Date.now()}`);
  return mod.ALL_ENUMERATION;
};

/** Read the real data, write the generated file. Non-CLI callers pass their own `root`. */
const generateEnumTypes = async (root = DEFAULT_ROOT) => {
  const allEnumeration = await loadAllEnumeration(enumerationSourceFor(root));
  const source = buildGeneratedTypesSource(allEnumeration);
  const outputPath = outputPathFor(root);
  writeFileSync(outputPath, source);
  return outputPath;
};

// Nothing in this file may call itself. An "am I the entry point" check
// (`process.argv[1] === import.meta.url`) once lived here and fired on every app
// launch, because once bundled into `dist/electron/main.js` both sides are the same
// file; it crashed every production build with `ERR_MODULE_NOT_FOUND`. The trigger
// lives in `generate-enum-types-cli.mjs`, which nothing imports.
export { buildGeneratedTypesSource, generateEnumTypes, CATEGORY_TYPE_NAMES };

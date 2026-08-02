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
 * Run with: `npm run generate:enum-types`.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPT_DIR, '..');
const ENUMERATION_SOURCE = path.join(ROOT, 'shared/game/data/enumeration/enumeration.ts');
const OUTPUT_PATH = path.join(ROOT, 'shared/game/data/enumeration/generated-types.ts');

/** category → the exported type name every consuming file already expects. */
const CATEGORY_TYPE_NAMES = {
  world: 'World',
  'screen-status': 'ScreenStatus',
  'screen-kind': 'ScreenKind',
  'interior-kind': 'InteriorKind',
  'connection-kind': 'ConnectionKind',
  'connection-side': 'ConnectionSide',
  'actor-kind': 'ActorKind',
  'check-kind': 'CheckKind',
  'item-category': 'ItemCategory',
  'item-origin': 'ItemOrigin',
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
const loadAllEnumeration = async () => {
  const mod = await import(`${pathToFileURL(ENUMERATION_SOURCE).href}?t=${Date.now()}`);
  return mod.ALL_ENUMERATION;
};

/** The core generation step — reads the real data, writes the generated file. Reused by callers other than the CLI (e.g. the Data Inspector's write path). */
const generateEnumTypes = async () => {
  const allEnumeration = await loadAllEnumeration();
  const source = buildGeneratedTypesSource(allEnumeration);
  writeFileSync(OUTPUT_PATH, source);
  return OUTPUT_PATH;
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  generateEnumTypes().then((outPath) => {
    console.log('Wrote', outPath);
  });
}

export { buildGeneratedTypesSource, generateEnumTypes };

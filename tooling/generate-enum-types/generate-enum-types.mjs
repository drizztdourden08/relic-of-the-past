/* @layer tooling-scripts @kind logic */
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT_WHEN_RUN_FROM_THE_CLI = path.join(SCRIPT_DIR, '..', '..');
const enumerationSourceFor = (root) => path.join(root, 'packages/game-data/src/data/records/enumeration/enumeration.ts');
const outputPathFor = (root) => path.join(root, 'packages/game-data/src/data/enumeration/enumeration.type.ts');

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

const HEADER = `/* @layer shared-game @kind types */
`;

const valuesByCategoryFirstSeenWins = (allEnumeration) => {
  const valuesByCategory = new Map();
  for (const entry of allEnumeration) {
    const values = valuesByCategory.get(entry.category) ?? [];
    if (!values.includes(entry.value)) values.push(entry.value);
    valuesByCategory.set(entry.category, values);
  }
  return valuesByCategory;
};

const buildGeneratedTypesSource = (allEnumeration) => {
  const valuesByCategory = valuesByCategoryFirstSeenWins(allEnumeration);

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

const loadAllEnumerationPastTheModuleCache = async (enumerationSource) => {
  const mod = await import(`${pathToFileURL(enumerationSource).href}?t=${Date.now()}`);
  return mod.ALL_ENUMERATION;
};

const generateEnumTypes = async (root = DEFAULT_ROOT_WHEN_RUN_FROM_THE_CLI) => {
  const allEnumeration = await loadAllEnumerationPastTheModuleCache(enumerationSourceFor(root));
  const source = buildGeneratedTypesSource(allEnumeration);
  const outputPath = outputPathFor(root);
  writeFileSync(outputPath, source);
  return outputPath;
};

export { buildGeneratedTypesSource, generateEnumTypes, CATEGORY_TYPE_NAMES };

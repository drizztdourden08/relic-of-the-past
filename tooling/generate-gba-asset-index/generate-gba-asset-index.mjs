/* @layer tooling-scripts @kind logic */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.join(SCRIPT_DIR, '..', '..');
const manifestSourceFor = (root) => path.join(root, 'packages/asset-extraction/src/sources/gba-alttp/asset-manifest.ts');
const outputPathFor = (root) => path.join(root, 'core/game-hooks/gba_asset_index.generated.h');

const HEADER = `/* @layer core-game-hooks @kind generated */
/**
 * GENERATED: do not hand-edit. Regenerate with \`npm run generate:gba-asset-index\`
 * (tooling/generate-gba-asset-index/generate-gba-asset-index.mjs), which reads
 * packages/asset-extraction/src/sources/gba-alttp/asset-manifest.ts and emits one
 * enum member per GBA ALttP supplement asset, in manifest order.
 */
#ifndef ZELDA3_GBA_ASSET_INDEX_GENERATED_H_
#define ZELDA3_GBA_ASSET_INDEX_GENERATED_H_
// clang-format off
`;

const FOOTER = `// clang-format on

#endif  // ZELDA3_GBA_ASSET_INDEX_GENERATED_H_
`;

const enumMemberNameFor = (assetName) => {
  const suffix = assetName.replace(/^kGba(Palace|Alttp)/, '');
  if (suffix === assetName) {
    throw new Error(`generate-gba-asset-index: manifest name "${assetName}" does not start with kGbaPalace/kGbaAlttp`);
  }
  return `kGbaAsset${suffix}`;
};

const buildGeneratedHeaderSource = (manifest) => {
  if (manifest.length === 0) {
    throw new Error('generate-gba-asset-index: GBA_ALTTP_ASSET_MANIFEST is empty');
  }

  const seen = new Set();
  const lines = manifest.map((entry, index) => {
    const memberName = enumMemberNameFor(entry.name);
    if (seen.has(memberName)) {
      throw new Error(`generate-gba-asset-index: duplicate generated enum member "${memberName}"`);
    }
    seen.add(memberName);
    const assignment = index === 0 ? ` = ${index}` : '';
    return `  ${memberName}${assignment},  // ${entry.name}: ${entry.description}`;
  });

  return `${HEADER}\nenum {\n${lines.join('\n')}\n  kGbaAlttpAssetCount,\n};\n${FOOTER}`;
};

const loadManifest = async (manifestSource) => {
  const mod = await import(`${pathToFileURL(manifestSource).href}?t=${Date.now()}`);
  return mod.GBA_ALTTP_ASSET_MANIFEST;
};

const generateGbaAssetIndex = async (root = DEFAULT_ROOT) => {
  const manifest = await loadManifest(manifestSourceFor(root));
  const source = buildGeneratedHeaderSource(manifest);
  const outputPath = outputPathFor(root);
  writeFileSync(outputPath, source);
  return outputPath;
};

const checkGbaAssetIndex = async (root = DEFAULT_ROOT) => {
  const manifest = await loadManifest(manifestSourceFor(root));
  const expected = buildGeneratedHeaderSource(manifest);
  const outputPath = outputPathFor(root);
  const actual = existsSync(outputPath) ? readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n') : null;
  return { outputPath, current: actual === expected };
};

export { buildGeneratedHeaderSource, checkGbaAssetIndex, enumMemberNameFor, generateGbaAssetIndex };

/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Generates `core/game-hooks/gba_asset_index.generated.h` from
 * `GBA_ALTTP_ASSET_MANIFEST` — one `kGbaAsset<Name>` enum member per
 * supplement asset, in the manifest's own order, plus the total count as the
 * final member.
 *
 * The GBA ALttP supplement container is read positionally by the C engine:
 * an asset's "index" is just its position among the `assets.add*` calls in
 * `compile-resources-gba-alttp.ts`. That compiler now iterates
 * `GBA_ALTTP_ASSET_MANIFEST` to decide call order (see that file), and this
 * script reads the same manifest to emit the matching C side — so inserting,
 * removing or reordering an asset only ever means editing the one manifest;
 * both languages move together instead of silently drifting apart.
 *
 * `GBA_ALTTP_ASSET_MANIFEST` is imported directly from its `.ts` source —
 * Node 24 strips erasable TypeScript syntax natively, and the module has no
 * runtime deps, so no ts-node / build step is needed here (same approach as
 * `generate-enum-types.mjs`).
 *
 * Run with: `npm run generate:gba-asset-index` (which runs
 * `generate-gba-asset-index-cli.mjs`, the only file that ever invokes
 * `generateGbaAssetIndex` unprompted — see `generate-enum-types-cli.mjs` for
 * why that trigger lives in its own never-imported file).
 *
 * The repo root defaults to a path relative to THIS script's own file —
 * correct for the CLI, where the script always runs from its real,
 * unbundled location. A caller that already knows the real repo root may
 * pass it in and skip the guess entirely.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.join(SCRIPT_DIR, '..');
const manifestSourceFor = (root) => path.join(root, 'shared/asset-extraction/sources/gba-alttp/asset-manifest.ts');
const outputPathFor = (root) => path.join(root, 'core/game-hooks/gba_asset_index.generated.h');

const HEADER = `/* @layer core-game-hooks @kind generated */
/**
 * GENERATED — do not hand-edit. Regenerate with \`npm run generate:gba-asset-index\`
 * (scripts/generate-gba-asset-index.mjs), which reads
 * shared/asset-extraction/sources/gba-alttp/asset-manifest.ts and emits one
 * enum member per GBA ALttP supplement asset, in manifest order.
 */
#ifndef ZELDA3_GBA_ASSET_INDEX_GENERATED_H_
#define ZELDA3_GBA_ASSET_INDEX_GENERATED_H_
`;

const FOOTER = `
#endif  // ZELDA3_GBA_ASSET_INDEX_GENERATED_H_
`;

/** `kGbaPalaceRoomIds` / `kGbaAlttpTextIds` -> `kGbaAssetRoomIds` / `kGbaAssetTextIds`. */
const enumMemberNameFor = (assetName) => {
  const suffix = assetName.replace(/^kGba(Palace|Alttp)/, '');
  if (suffix === assetName) {
    throw new Error(`generate-gba-asset-index: manifest name "${assetName}" does not start with kGbaPalace/kGbaAlttp`);
  }
  return `kGbaAsset${suffix}`;
};

/** One enum line per manifest entry, plus a trailing count member. */
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
    return `  ${memberName}${assignment},  // ${entry.name} — ${entry.description}`;
  });

  return `${HEADER}\nenum {\n${lines.join('\n')}\n  kGbaAlttpAssetCount,\n};\n${FOOTER}`;
};

/**
 * A cache-busting query string on every import, matching
 * `generate-enum-types.mjs` — harmless for the one-shot CLI, and correct for
 * any future long-lived caller that regenerates repeatedly in one process.
 */
const loadManifest = async (manifestSource) => {
  const mod = await import(`${pathToFileURL(manifestSource).href}?t=${Date.now()}`);
  return mod.GBA_ALTTP_ASSET_MANIFEST;
};

/**
 * The core generation step — reads the real manifest, writes the generated header.
 */
const generateGbaAssetIndex = async (root = DEFAULT_ROOT) => {
  const manifest = await loadManifest(manifestSourceFor(root));
  const source = buildGeneratedHeaderSource(manifest);
  const outputPath = outputPathFor(root);
  writeFileSync(outputPath, source);
  return outputPath;
};

export { buildGeneratedHeaderSource, enumMemberNameFor, generateGbaAssetIndex };

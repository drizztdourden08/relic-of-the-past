/* @layer tooling-scripts @kind build */
/**
 * Builds the Archipelago world package as release assets.
 *
 *   pnpm run build:apworld
 *
 * 1. Runs the exporter (packages/randomizer/src/archipelago/export/export-world.ts) through
 *    Vite SSR.
 * 2. packApworld hands the package folder, the exporter files and the supported Archipelago
 *    versions to the Archipelia client kit (buildApworldSet), which zips the package
 *    reproducibly, stamps archipelago.json with AP_WORLD_VERSION and the first and last of
 *    SUPPORTED_AP_VERSIONS, and writes build/archipelago/: relic_of_the_past-ap<version>.apworld
 *    for every supported Archipelago version, relic_of_the_past.apworld (a copy of the newest),
 *    the index relic_of_the_past.apworld.json, and the Archipelia release files: archipelia.json,
 *    archipelia-thumbnail.png and archipelia-description.md (from apps/desktop/release-assets).
 * 3. Copies the builds to apps/desktop/public/archipelago/<version>/relic_of_the_past.apworld with
 *    builds.json (the index), where the app fetches them like the wasm (gitignored).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { APP_PACKAGE_JSON, MODULE_NAME, OUT_DIR, PACKAGE_DIR, PUBLIC_DIR, ROOT } from './apworld.constants.mjs';
import { runExporter } from './run-exporter.mjs';
import { packApworld } from './pack-apworld.mjs';
import { writePublicBuilds } from './write-public-builds.mjs';

const main = async () => {
  const world = await runExporter();
  const { files, index, bytes } = await packApworld({
    sourceDir: PACKAGE_DIR,
    outDir: OUT_DIR,
    moduleName: MODULE_NAME,
    versions: world.apVersions,
    data: world.files,
    game: world.game,
    worldVersion: world.worldVersion,
    appVersion: JSON.parse(readFileSync(APP_PACKAGE_JSON, 'utf8')).version,
  });
  writePublicBuilds({ publicDir: PUBLIC_DIR, moduleName: MODULE_NAME, versions: world.apVersions, bytes, index });
  console.log(`build-apworld: ${path.relative(ROOT, OUT_DIR)}: ${files.length} apworld files (${index.builds[0].sha256.slice(0, 12)}, ${index.builds[0].size} bytes each)`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

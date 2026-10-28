/* @layer tooling-scripts @kind build */
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

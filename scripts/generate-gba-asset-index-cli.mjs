/**
 * @layer tooling-scripts
 * @kind logic
 *
 * The only file that ever invokes `generateGbaAssetIndex` unprompted.
 *
 * Kept as its own never-imported entry point for the same reason as
 * `generate-enum-types-cli.mjs`: a self-invoking "am I the process entry
 * point" check inside the library module would misfire the moment that
 * module is imported by something that later gets bundled (e.g. a future
 * Electron-side writer), because the bundle's own `import.meta.url` can end
 * up equal to `process.argv[1]`. Splitting the trigger out here makes that
 * failure mode structurally impossible instead of relying on a smarter check.
 *
 * Run with: `npm run generate:gba-asset-index`.
 */
import { generateGbaAssetIndex } from './generate-gba-asset-index.mjs';

generateGbaAssetIndex().then((outPath) => {
  console.log('Wrote', outPath);
});

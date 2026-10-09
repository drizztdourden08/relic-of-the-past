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
 * Run with: `pnpm run generate:gba-asset-index`, or with `--check`
 * (`pnpm run generate:gba-asset-index:check`, a gate step) to write nothing and
 * exit 1 when the committed header no longer matches the manifest.
 */
import { checkGbaAssetIndex, generateGbaAssetIndex } from './generate-gba-asset-index.mjs';

if (process.argv.includes('--check')) {
  checkGbaAssetIndex().then(({ outputPath, current }) => {
    if (current) {
      console.log('Up to date', outputPath);
      return;
    }
    console.error(`STALE ${outputPath}: run pnpm run generate:gba-asset-index`);
    process.exitCode = 1;
  });
} else {
  generateGbaAssetIndex().then((outPath) => {
    console.log('Wrote', outPath);
  });
}

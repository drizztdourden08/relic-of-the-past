/* @layer tooling-scripts @kind logic */
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

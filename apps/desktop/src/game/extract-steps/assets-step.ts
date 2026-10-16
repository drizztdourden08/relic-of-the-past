/* @layer bridge-wasm @kind logic */
import { bakeAssetSet } from '../../storage/asset-files/bake-asset-set';
import { defineStep } from './define-step';

const assetsStep = defineStep<'assets'>(({ supplementRoms, languages }, { romBytes }, report) => {
  report.line('Compiling the asset set...');
  return bakeAssetSet({ romBytes, supplementRoms, languages }, (message) => report.log(`[assets] ${message}`, 'warn'));
});

export { assetsStep };

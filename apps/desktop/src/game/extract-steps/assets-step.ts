/* @layer bridge-wasm @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { bakeAssetSet } from '../../storage/asset-files/bake-asset-set';
import { defineStep } from './define-step';

const assetsStep = defineStep<'assets'>(({ supplementRoms, languages }, { romBytes }, report) => {
  report.line(msg('data-manager:jobs.line.compileAssets'));
  return bakeAssetSet({ romBytes, supplementRoms, languages }, (message) => report.log(`[assets] ${message}`, 'warn'));
});

export { assetsStep };

/* @layer bridge-wasm @kind logic */
import { serveAssetSteps } from '@drizztdourden08/brock-port-kit/web-worker';
import { assetsStep, japaneseGraphicsStep, languageStep, menuTextStep, patchedLanguageStep, spritesStep } from './extract-steps';

serveAssetSteps({
  assets: assetsStep,
  'japanese-graphics': japaneseGraphicsStep,
  language: languageStep,
  'menu-text': menuTextStep,
  'patched-language': patchedLanguageStep,
  sprites: spritesStep,
});

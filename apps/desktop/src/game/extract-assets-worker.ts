/* @layer bridge-wasm @kind logic */
import { serveAssetSteps } from '@drizztdourden08/brock-port-kit/web-worker';
import { assetsStep, languageStep, menuTextStep, patchedLanguageStep, spritesStep } from './extract-steps';

serveAssetSteps({
  assets: assetsStep,
  language: languageStep,
  'menu-text': menuTextStep,
  'patched-language': patchedLanguageStep,
  sprites: spritesStep,
});

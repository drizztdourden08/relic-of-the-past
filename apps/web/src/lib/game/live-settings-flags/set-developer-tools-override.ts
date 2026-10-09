/* @layer bridge-wasm @kind logic */
import { featureOverrides } from './feature-overrides';

const setDeveloperToolsOverride = (on: boolean | null): void => {
  featureOverrides.developerTools = on;
};

export { setDeveloperToolsOverride };

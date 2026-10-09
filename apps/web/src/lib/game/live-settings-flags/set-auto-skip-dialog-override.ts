/* @layer bridge-wasm @kind logic */
import { featureOverrides } from './feature-overrides';

const setAutoSkipDialogOverride = (on: boolean | null): void => {
  featureOverrides.autoSkipDialog = on;
};

export { setAutoSkipDialogOverride };

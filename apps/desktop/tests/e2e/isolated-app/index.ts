/* @layer tests @kind barrel */
export { E2E_INSTANCE, FIXTURES, MAIN_JS, STATE_SPEC_CONFIG } from './isolated-app.constants';
export { launchApp } from './launch-app';
export { E2E_VIA_CLI_ENV, assertLaunchedViaCli } from './require-cli';
export type { LaunchOptions, LaunchedApp, StoredSlotSeed, ProfileSeed } from './isolated-app.type';

/* @layer tests @kind barrel */
export { E2E_INSTANCE, FIXTURES, MAIN_JS, STATE_SPEC_CONFIG } from './isolated-app.constants';
export { launchApp, startApp } from './launch-app';
export { waitForMainWindow } from './main-window';
export type { LaunchOptions, LaunchedApp, ModernSlotSeed, ProfileSeed, StartedApp } from './isolated-app.type';

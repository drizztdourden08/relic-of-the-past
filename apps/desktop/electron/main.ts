/* @layer electron-main @kind entry */
import { bootstrapApp } from '@drizztdourden08/brock-electron/main';
import { mainModules } from '../.brock/modules.main';
import { mainBootTasks } from '../.brock/boot.main';
import { mainHandlers } from '../.brock/handlers.main';
import { product } from '../src/product';
import { rotpProfileHooks } from '../src/profiles/rotp-profile-hooks';
import { ROTP_AUTOMATION_FLAGS } from './automation/automation-flags.constants';
import { deferGameScreenshot } from './automation/defer-game-screenshot';
import { rotpRendererFlags } from './automation/rotp-renderer-flags';
import { ROTP_DATA_DOMAINS } from './storage/data-domains.constants';
import { runVelopackHooks } from './lifecycle/run-velopack-hooks';
import { onReady } from './lifecycle/on-ready';
import { onWindow } from './lifecycle/on-window';
import { onWillQuit } from './lifecycle/on-will-quit';
import { listenForOpenUrl } from './store/boot';

runVelopackHooks();
deferGameScreenshot(process.argv);
listenForOpenUrl();

bootstrapApp(product, {
  modules: mainModules,
  bootTasks: mainBootTasks,
  handlers: mainHandlers,
  automationFlags: ROTP_AUTOMATION_FLAGS,
  dataDomains: ROTP_DATA_DOMAINS,
  profileHooks: rotpProfileHooks,
  rendererFlags: rotpRendererFlags,
  onReady,
  onWindow,
  onWillQuit,
});

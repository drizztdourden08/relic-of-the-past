/* @layer electron-main @kind entry */
import { bootstrapApp } from '@drizztdourden08/brock-electron/main';
import { mainModules } from '../.brock/modules.main';
import { mainBootTasks } from '../.brock/boot.main';
import { mainHandlers } from '../.brock/handlers.main';
import { product } from '../src/product';
import { rotpProfileHooks } from '../src/profiles/rotp-profile-hooks';
import { ROTP_AUTOMATION_FLAGS } from './automation/automation-flags.constants';
import { rotpRendererFlags } from './automation/rotp-renderer-flags';
import { ROTP_DATA_DOMAINS } from '../src/storage/data-domains.constants';
import { installedFileGuard } from './storage/installed-file-guard';
import { sanctuaryBugReport } from './sanctuary/bug-report';
import { onReady } from './lifecycle/on-ready';
import { onWindow } from './lifecycle/on-window';

bootstrapApp(product, {
  modules: mainModules,
  bootTasks: mainBootTasks,
  handlers: mainHandlers,
  automationFlags: ROTP_AUTOMATION_FLAGS,
  dataDomains: ROTP_DATA_DOMAINS,
  fileGuard: installedFileGuard,
  profileHooks: rotpProfileHooks,
  rendererFlags: rotpRendererFlags,
  bugReport: sanctuaryBugReport,
  onReady,
  onWindow,
});

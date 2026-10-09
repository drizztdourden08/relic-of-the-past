/* @layer electron-main @kind logic */
import type { InstallLink } from '@shared/store/deep-link';
import { emit } from '@drizztdourden08/brock-electron/main';
import { rotpAutomationFlags } from '../../automation/rotp-automation-flags';
import { bringForward } from './bring-forward';
import { installLinkState } from './install-link-state';

const deliverInstallLink = (link: InstallLink): void => {
  const { target, shellReady, queued } = installLinkState;
  if (!target || !shellReady) {
    queued.push(link);
    return;
  }
  if (!rotpAutomationFlags.isAutomationLaunch()) bringForward(target);
  emit(target, 'store:openInstall', { itemId: link.itemId, version: link.version });
};

export { deliverInstallLink };

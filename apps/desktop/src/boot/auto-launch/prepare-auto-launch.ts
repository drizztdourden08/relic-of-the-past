/* @layer renderer-app @kind logic */
import { loadInputScript } from '../input-script/load-input-script';
import { prepareLaunchConnection } from '../launch-connect/prepare-launch-connection';
import { screenshotHold } from '../screenshot-hold';
import type { AutoLaunch } from './auto-launch.type';

const prepareAutoLaunch = async (active: Profile, bootsGame: boolean): Promise<AutoLaunch | null> => {
  const script = await loadInputScript();
  const profile = script.kind === 'invalid' ? null : await prepareLaunchConnection(active);
  if (profile !== null && script.kind !== 'invalid' && bootsGame) return { script, profile };
  screenshotHold.release();
  return null;
};

export { prepareAutoLaunch };

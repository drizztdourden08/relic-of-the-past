/* @layer renderer-app @kind logic */
import { loadInputScript } from '../input-script/load-input-script';
import type { LoadedScript } from '../input-script/load-input-script';
import { prepareLaunchConnection } from '../launch-connect/prepare-launch-connection';
import { screenshotHold } from '../screenshot-hold';

type AutoLaunch = { script: LoadedScript; profile: Profile };

/** Reads --input-script and runs --ap-connect / --lobby-join / --profile-name; null means the launch stops here, with no screenshot left waiting. */
const prepareAutoLaunch = async (active: Profile, bootsGame: boolean): Promise<AutoLaunch | null> => {
  const script = await loadInputScript();
  const profile = script.kind === 'invalid' ? null : await prepareLaunchConnection(active);
  if (profile !== null && script.kind !== 'invalid' && bootsGame) return { script, profile };
  screenshotHold.release();
  return null;
};

export { prepareAutoLaunch };
export type { AutoLaunch };

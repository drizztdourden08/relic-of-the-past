/* @layer renderer-app @kind logic */
import { loadInputScript } from '../input-script/load-input-script';
import type { LoadedScript } from '../input-script/load-input-script';
import { prepareLaunchConnection } from '../launch-connect/prepare-launch-connection';
import { screenshotHold } from '../screenshot-hold';

/** Reads --input-script and runs --ap-connect / --lobby-join; null means the launch stops here, with no screenshot left waiting. */
const prepareAutoLaunch = async (profile: Profile, bootsGame: boolean): Promise<LoadedScript | null> => {
  const script = await loadInputScript();
  const ready = script.kind !== 'invalid' && (await prepareLaunchConnection(profile));
  if (ready && bootsGame) return script;
  screenshotHold.release();
  return null;
};

export { prepareAutoLaunch };

/* @layer bridge-wasm @kind logic */
import { isKitError, joinLobby } from '@rotp/randomizer';
import { archipelagoYamlOf } from '@app/archipelago/player-yaml';
import { loadBuildsIndex, worldPackageFor } from '@app/archipelago/world-package';
import { pickBuild } from '../builds/pick-build';
import { clientInfoOf } from '../client-info-of';
import { joinConfigOf } from './join-config-of';
import type { StartJoinInput, StartJoinResult } from './join-input.type';

const startJoin = async (input: StartJoinInput): Promise<StartJoinResult> => {
  const { server, code, ap, config, token } = input;
  const build = pickBuild((await loadBuildsIndex())?.builds ?? [], ap);
  const bytes = await worldPackageFor(ap);
  if (build === null || bytes === null) return { error: `The bundled build for Archipelago ${ap} is missing.` };
  const client = await clientInfoOf();
  try {
    const { slotName, yaml } = archipelagoYamlOf(config, client.version);
    return { session: joinLobby(joinConfigOf({ server, code, ap, slotName, yaml, build, bytes: new Uint8Array(bytes), client, token })) };
  } catch (failure) {
    if (isKitError(failure)) return { error: failure.message };
    throw failure;
  }
};

export { startJoin };

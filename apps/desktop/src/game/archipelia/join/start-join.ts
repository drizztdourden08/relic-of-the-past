/* @layer bridge-wasm @kind logic */
import { joinLobby } from '@rotp/randomizer';
import type { LobbySession } from '@rotp/randomizer';
import { archipelagoYamlOf } from '@app/archipelago/player-yaml';
import { loadBuildsIndex, worldPackageFor } from '@app/archipelago/world-package';
import { pickBuild } from '../builds/pick-build';
import { clientInfoOf } from '../client-info-of';
import { joinConfigOf } from './join-config-of';
import type { StartJoinInput } from './join-input.type';

const startJoin = async (input: StartJoinInput): Promise<LobbySession | null> => {
  const { server, code, ap, config, token } = input;
  const build = pickBuild((await loadBuildsIndex())?.builds ?? [], ap);
  const bytes = await worldPackageFor(ap);
  if (build === null || bytes === null) return null;
  const client = await clientInfoOf();
  const { slotName, yaml } = archipelagoYamlOf(config, client.version);
  return joinLobby(joinConfigOf({ server, code, ap, slotName, yaml, build, bytes: new Uint8Array(bytes), client, token }));
};

export { startJoin };

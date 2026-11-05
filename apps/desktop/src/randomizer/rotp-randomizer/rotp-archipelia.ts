/* @layer renderer-app @kind logic */
import type { ArchipeliaGame } from '@drizztdourden08/brock-randomizer';
import { AP_WORLD_VERSION, WORLD_MODULE_NAME } from '@rotp/randomizer';
import { archipelagoYamlOf } from '@app/archipelago/player-yaml';
import { publicAsset } from '@app/public-asset/public-asset';
import { ROTP_LOBBY_CLIENT } from './rotp-archipelia.constants';

const rotpArchipelia: ArchipeliaGame = {
  module: WORLD_MODULE_NAME,
  worldVersion: AP_WORLD_VERSION,
  client: ROTP_LOBBY_CLIENT,
  playerFile: archipelagoYamlOf,
  assetUrl: publicAsset,
};

export { rotpArchipelia };

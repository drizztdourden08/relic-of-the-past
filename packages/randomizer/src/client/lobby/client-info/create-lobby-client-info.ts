/* @layer bridge-wasm @kind logic */
import type { ClientInfo } from '@drizztdourden08/archipelia-lobby-protocol';
import {
  LOBBY_SDK,
  ROTP_CLIENT_ID,
  ROTP_CLIENT_NAME,
  ROTP_HOMEPAGE,
  ROTP_UNSIGNED_CLIENT_ID,
  ROTP_UNSIGNED_CLIENT_NAME,
} from '../lobby.constants';
import type { ClientInfoInput } from './client-info.type';

const createLobbyClientInfo = ({ version, build, signed, platform }: ClientInfoInput): ClientInfo => {
  const info: ClientInfo = {
    id: signed === true ? ROTP_CLIENT_ID : ROTP_UNSIGNED_CLIENT_ID,
    name: signed === true ? ROTP_CLIENT_NAME : ROTP_UNSIGNED_CLIENT_NAME,
    version,
    platform,
    homepage: ROTP_HOMEPAGE,
    sdk: LOBBY_SDK,
  };
  if (build !== undefined && build !== '') info.build = build;
  return info;
};

export { createLobbyClientInfo };

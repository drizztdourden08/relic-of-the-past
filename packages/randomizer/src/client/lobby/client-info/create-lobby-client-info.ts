/* @layer bridge-wasm @kind logic */
import type { ClientInfo } from '@archipelia/lobby-protocol';
import { LOBBY_SDK, ROTP_CLIENT_ID, ROTP_CLIENT_NAME, ROTP_HOMEPAGE } from '../lobby.constants';
import type { ClientInfoInput } from './client-info.type';

const createLobbyClientInfo = ({ version, build, platform }: ClientInfoInput): ClientInfo => {
  const info: ClientInfo = {
    id: ROTP_CLIENT_ID,
    name: ROTP_CLIENT_NAME,
    version,
    platform,
    homepage: ROTP_HOMEPAGE,
    sdk: LOBBY_SDK,
  };
  if (build !== undefined && build !== '') info.build = build;
  return info;
};

export { createLobbyClientInfo };

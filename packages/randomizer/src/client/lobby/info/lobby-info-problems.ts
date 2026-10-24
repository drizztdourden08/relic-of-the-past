/* @layer bridge-wasm @kind logic */
import { checkClientVersion, checkWorldVersion } from '@archipelia/lobby-protocol';
import type { Failure } from '@archipelia/lobby-protocol';
import { ROTP_GAME } from '../lobby.constants';
import type { LobbyInfo } from './lobby-info.type';
import type { InfoCheckInput } from './lobby-info-problems.type';
import { sizeProblems } from './size-problems';

const lobbyInfoProblems = (info: LobbyInfo, input: InfoCheckInput): Failure[] => {
  const game = input.game ?? ROTP_GAME;
  const found: Failure[] = [];
  const version = checkClientVersion(info.lobby.engine.ap, {
    client: input.client,
    archipelago: { version: input.archipelagoVersion },
  });
  if (version !== null) found.push(version);
  const fixed = info.lobby.worlds.find((world) => world.game === game)?.worldVersion;
  const world = checkWorldVersion(fixed, game, input.worldVersion);
  if (world !== null) found.push(world);
  found.push(...sizeProblems(info.limits, input));
  return found;
};

export { lobbyInfoProblems };

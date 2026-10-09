/* @layer bridge-wasm @kind logic */
import { describeScreen } from '@shared/game/logic/queries/describe-screen';
import { screenForRoomIndex } from '@shared/game/logic/queries/room-screen';
import type { GameScreenId } from '@shared/game/logic/queries/game-id';
import { resolved } from './resolved';
import type { ResolvedTarget } from './resolve-target.type';

const roomTarget = (room: number, palace?: number): ResolvedTarget => {
  const native: GameScreenId = palace === undefined ? { kind: 'room', room } : { kind: 'room', room, palace };
  const described = describeScreen({ kind: 'game', gameId: native });
  if (described.id) return resolved(native, described.name ?? described.hexLabel, described.id);
  const record = screenForRoomIndex(room);
  return resolved(native, record ? record.name : described.hexLabel, record?.id ?? null);
};

export { roomTarget };

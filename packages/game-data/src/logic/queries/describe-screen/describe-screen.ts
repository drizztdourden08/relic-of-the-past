/* @layer shared-game @kind logic */
import { findOne } from '../../../data';
import type { ScreenId, ScreenRecord } from '../../../data';
import { gameScreenIdOf, screenForGameId } from '../game-id';
import type { GameScreenId } from '../game-id';
import { hexLabelOf } from '../game-id/hex-label-of';
import { DARK_WORLD_OVERWORLD_OFFSET } from './describe-screen.constants';
import type { ScreenDescription, ScreenRef } from './describe-screen.type';

const unifiedGameId = (gameId: GameScreenId, world: 'light' | 'dark' | undefined): GameScreenId => {
  if (gameId.kind !== 'overworld' || world !== 'dark') return gameId;
  return { kind: 'overworld', screen: gameId.screen + DARK_WORLD_OVERWORLD_OFFSET };
};

const hexLabelFor = (ref: ScreenRef, record: ScreenRecord | undefined): string => {
  if (ref.kind === 'game') return hexLabelOf(unifiedGameId(ref.gameId, ref.world));
  if (record) {
    const gameId = gameScreenIdOf(record);
    if (gameId) return hexLabelOf(gameId);
  }
  return ref.id;
};

const recordFor = (ref: ScreenRef): ScreenRecord | undefined => (
  ref.kind === 'id'
    ? findOne('screen', (s) => s.id === ref.id)
    : screenForGameId(unifiedGameId(ref.gameId, ref.world))
);

const describeScreen = (ref: ScreenRef): ScreenDescription => {
  const record = recordFor(ref);
  const hexLabel = hexLabelFor(ref, record);
  const id = ref.kind === 'id' ? (ref.id as ScreenId) : (record?.id ?? null);
  const name = record ? record.name : null;
  return { name, id, hexLabel, label: name ? `${name} (${id})` : hexLabel };
};

export { describeScreen };

/* @layer shared-game @kind logic */
/**
 * Reverse gameId -> record lookups, pre-built once per rebuild() call. There is
 * no per-call scan. Native code (the WASM bridge, C hooks) only ever knows native
 * values (a room index, a chest index, a sprite type byte), never our app ids.
 * Split by entity kind (see coding-standards' file-size rule); this barrel is
 * the only thing the rest of the dataset layer imports from.
 */
import { all } from '../registry';
import { rebuildActorIndex, actorByGameId, actorsByGameSpriteType } from './actor';
import { rebuildCheckIndex, checkByGameId } from './check';
import { rebuildDungeonIndex, dungeonByGameId } from './dungeon';
import { rebuildItemIndex, itemByGameId } from './item';
import { rebuildScreenIndex, screenByGameId } from './screen';

const rebuild = (): void => {
  rebuildScreenIndex(all('screen'));
  rebuildCheckIndex(all('check'));
  rebuildItemIndex(all('item'));
  rebuildActorIndex(all('actor'));
  rebuildDungeonIndex(all('dungeon'));
};

export {
  actorByGameId, actorsByGameSpriteType, checkByGameId, dungeonByGameId, itemByGameId, rebuild,
  screenByGameId,
};

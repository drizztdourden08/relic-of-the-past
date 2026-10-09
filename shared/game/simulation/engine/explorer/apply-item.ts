/* @layer shared-game @kind logic */
import type { DungeonId, ItemId } from '../../../data';
import { tokensForItem } from '../../requirements-map/tokens-for-item';
import { keyKindOf } from '../../key-items';
import type { EngineState } from '../state/state.type';
import { addKey } from './add-key';
import { syncReachTokens } from './sync-reach-tokens';

const applyItem = (state: EngineState, itemId: ItemId, dungeon?: DungeonId): string[] => {
  const keyKind = keyKindOf(itemId);
  if (keyKind) {
    if (!dungeon) return [];
    if (keyKind === 'small') {
      addKey(state, dungeon);
      return [`smallkey:${dungeon}`];
    }
    state.bigKeys.add(dungeon);
    return [`bigkey:${dungeon}`];
  }
  state.inventory.add(itemId);
  syncReachTokens(state);
  return tokensForItem(itemId);
};

export { applyItem };

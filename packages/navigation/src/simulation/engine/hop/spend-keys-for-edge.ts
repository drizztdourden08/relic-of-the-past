/* @layer shared-game @kind logic */
import { ANY_DUNGEON, keyTargetOf } from '../../dungeon-key-target';
import { spendKey } from '../explorer/spend-key';
import type { EngineState } from '../state/state.type';
import type { ScreenEdge } from '../traversal/traversal.type';

const spendKeysForEdge = (s: EngineState, edge: ScreenEdge): void => {
  for (const group of edge.requirements) {
    for (const token of group) {
      if (!token.startsWith('smallkey:')) continue;
      const target = keyTargetOf(token.slice('smallkey:'.length));
      if (target && target !== ANY_DUNGEON) spendKey(s, target);
    }
  }
};

export { spendKeysForEdge };

/* @layer renderer-widgets @kind logic */
import type { EngineState, SimEvent } from '@shared/game/simulation';
import { screenLabel } from '@shared/game/simulation';
import { detectFor } from '../../../../../../lib/game/simulator/observe';
import type { DetectCache } from '../../../../../../lib/game/simulator/observe';

const exitsEvent = (state: EngineState, cache: DetectCache): SimEvent | null => {
  const exits = detectFor(state, cache)?.exits;
  if (!exits || exits.length === 0) return null;
  const fmt = exits.map((e) => {
    const steps = e.steps !== undefined ? String(e.steps) : '?';
    const leaves = e.stepsNote === 'other-screen';
    const hop = e.stepsNote === 'via-hop' ? ', via hop' : '';
    const at = e.fromTile ? ` [${e.fromTile.col},${e.fromTile.row}]` : '';
    return `${screenLabel(e.to)}${at} (${steps} steps${leaves ? ', leaves area' : ''}${hop})`;
  });
  return { level: 'narrative', msg: `Exits by walk distance: ${fmt.join(', ')}`, step: state.step };
};

export { exitsEvent };

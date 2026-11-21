/* @layer renderer-widgets @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { EngineState, SimEvent } from '@rotp/navigation';
import { screenLabel } from '@app/game/record-text';
import { optionText } from '@rotp/randomizer';
import { detectFor } from '../../../game/simulator/observe/index';
import type { DetectCache } from '../../../game/simulator/observe/index';
import { codedEvent } from './coded-event';

const separator = (): string => optionText(msg('views-simulator:event.list.separator'));

const exitDetails = (e: { steps?: number; stepsNote?: string }): string => {
  const parts = [e.steps !== undefined
    ? optionText(msg('views-simulator:event.exit.steps', { steps: e.steps }))
    : optionText(msg('views-simulator:event.exit.steps.unknown'))];
  if (e.stepsNote === 'other-screen') parts.push(optionText(msg('views-simulator:event.exit.leaves')));
  if (e.stepsNote === 'via-hop') parts.push(optionText(msg('views-simulator:event.exit.hop')));
  return parts.join(separator());
};

const exitsEvent = (state: EngineState, cache: DetectCache): SimEvent | null => {
  const exits = detectFor(state, cache)?.exits;
  if (!exits || exits.length === 0) return null;
  const list = exits.map((e) => {
    const at = e.fromTile ? ` [${e.fromTile.col},${e.fromTile.row}]` : '';
    return `${screenLabel(e.to)}${at} (${exitDetails(e)})`;
  });
  return codedEvent('exits', msg('views-simulator:event.exits', { list: list.join(separator()) }), state.step);
};

export { exitsEvent };

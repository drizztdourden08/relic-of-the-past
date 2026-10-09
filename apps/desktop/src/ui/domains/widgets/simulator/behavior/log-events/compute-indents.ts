/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import { classifyEvent } from './classify-event';

const computeIndents = (events: SimEvent[]): number[] => {
  let inArea = false;
  return events.map((event) => {
    const { kind } = classifyEvent(event);
    if (kind === 'seq' || kind === 'outcome') return 0;
    if (kind === 'area') {
      inArea = !/^Leaving/.test(event.msg);
      return 1;
    }
    const screenLevel = inArea ? 2 : 1;
    return kind === 'screen' || kind === 'backtrack' ? screenLevel : screenLevel + 1;
  });
};

export { computeIndents };

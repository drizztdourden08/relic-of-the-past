/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import { classifyEvent } from './classify-event';
import { computeIndents } from './compute-indents';

const eventsToText = (events: SimEvent[]): string => {
  const indents = computeIndents(events);
  return events.map((e, i) => {
    const { tag } = classifyEvent(e);
    return `${'  '.repeat(indents[i])}${tag.replace(/[▸◂§▣] /, '')}\t${e.msg}`;
  }).join('\n');
};

export { eventsToText };

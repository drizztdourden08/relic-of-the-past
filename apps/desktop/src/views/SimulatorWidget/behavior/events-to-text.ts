/* @layer renderer-widgets @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { SimEvent } from '@rotp/navigation';
import { classifyEvent } from './classify-event';
import { computeIndents } from './compute-indents';

const eventsToText = (events: SimEvent[], text: (value: Text) => string): string => {
  const indents = computeIndents(events);
  return events.map((e, i) => {
    const { tag } = classifyEvent(e);
    return `${'  '.repeat(indents[i] ?? 0)}${text(tag).replace(/[▸◂§▣] /, '')}\t${e.msg}`;
  }).join('\n');
};

export { eventsToText };

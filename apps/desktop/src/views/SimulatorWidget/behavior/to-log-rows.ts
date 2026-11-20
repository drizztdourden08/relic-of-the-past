/* @layer renderer-widgets @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { SimEvent } from '@rotp/navigation';
import type { LogRow } from '@drizztdourden08/tessera/composites';
import { classifyEvent } from './classify-event';
import { startTileOf } from './coded-event';
import { computeIndents } from './compute-indents';

const messageOf = (event: SimEvent, kind: string): string => {
  if (kind !== 'pos') return event.msg;
  return startTileOf(event) ?? event.msg.replace(/^(START|END) /, '');
};

const toLogRows = (events: SimEvent[], text: (value: Text) => string): LogRow[] => {
  const indents = computeIndents(events);
  return events.map((event, index) => {
    const { kind, tag } = classifyEvent(event);
    return {
      id: `${event.step}-${index}`,
      gutter: String(index + 1),
      tag: text(tag),
      kind,
      message: messageOf(event, kind),
      indent: indents[index],
    };
  });
};

export { toLogRows };

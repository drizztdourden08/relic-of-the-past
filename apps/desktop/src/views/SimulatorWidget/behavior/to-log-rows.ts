/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import type { LogRow } from '@drizztdourden08/tessera/composites';
import { classifyEvent } from './classify-event';
import { computeIndents } from './compute-indents';

const toLogRows = (events: SimEvent[]): LogRow[] => {
  const indents = computeIndents(events);
  return events.map((event, index) => {
    const { kind, tag } = classifyEvent(event);
    return {
      id: `${event.step}-${index}`,
      gutter: String(index + 1),
      tag,
      kind,
      message: kind === 'pos' ? event.msg.replace(/^(START|END) /, '') : event.msg,
      indent: indents[index],
    };
  });
};

export { toLogRows };

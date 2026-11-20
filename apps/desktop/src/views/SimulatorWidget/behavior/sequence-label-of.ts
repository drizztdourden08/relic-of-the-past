/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import { codedEventData } from './coded-event-data';

const sequenceLabelOf = (event: SimEvent): string | null => codedEventData(event).label ?? null;

export { sequenceLabelOf };

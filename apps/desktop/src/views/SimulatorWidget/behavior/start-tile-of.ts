/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import { codedEventData } from './coded-event-data';

const startTileOf = (event: SimEvent): string | null => {
  const { col, row } = codedEventData(event);
  return col === undefined || row === undefined ? null : `${col},${row}`;
};

export { startTileOf };

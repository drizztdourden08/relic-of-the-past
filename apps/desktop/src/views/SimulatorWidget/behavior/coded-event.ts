/* @layer renderer-widgets @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { optionText } from '@rotp/randomizer';
import type { SimEvent } from '@rotp/navigation';
import type { LogCode } from '../SimulatorWidget.type';

const codedEvent = (code: LogCode, text: Text, step: number, extra: object = {}): SimEvent => ({
  level: 'narrative',
  msg: optionText(text),
  step,
  data: { logCode: code, ...extra },
});

const dataOf = (event: SimEvent): { logCode?: LogCode; label?: string; col?: number; row?: number } =>
  (typeof event.data === 'object' && event.data !== null ? event.data : {}) as { logCode?: LogCode; label?: string; col?: number; row?: number };

const logCodeOf = (event: SimEvent): LogCode | undefined => dataOf(event).logCode;
const sequenceLabelOf = (event: SimEvent): string | null => dataOf(event).label ?? null;
const startTileOf = (event: SimEvent): string | null => {
  const { col, row } = dataOf(event);
  return col === undefined || row === undefined ? null : `${col},${row}`;
};

export { codedEvent, logCodeOf, sequenceLabelOf, startTileOf };

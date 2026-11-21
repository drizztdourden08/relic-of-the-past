/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import type { LogCode } from '../SimulatorWidget.type';
import { codedEventData } from './coded-event-data';

const logCodeOf = (event: SimEvent): LogCode | undefined => codedEventData(event).logCode;

export { logCodeOf };

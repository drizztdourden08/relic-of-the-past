/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import type { LogCode } from '../SimulatorWidget.type';

const codedEventData = (event: SimEvent): { logCode?: LogCode; label?: string; col?: number; row?: number } =>
  (typeof event.data === 'object' && event.data !== null ? event.data : {});

export { codedEventData };

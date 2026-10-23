/* @layer renderer-lib @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import { controllerInputStore } from '../controller-input-store';
import { DIAG_CLOCK_PREFIX } from './controller-event-log.constants';
import { controllerEventStore } from './controller-event-store';
import { recordControllerEvent } from './record-controller-event';

const recordDiag = (entry: string): void => recordControllerEvent('hid', entry.replace(DIAG_CLOCK_PREFIX, ''));

const startControllerEventLog = (): (() => void) => {
  if (controllerEventStore.stop) return controllerEventStore.stop;
  const api = inputApi();
  for (const entry of controllerInputStore.getDiagLog()) recordDiag(entry);
  const unsubscribers = [
    api.onAdded((info) => recordControllerEvent('connect', info.name || info.deviceKey)),
    api.onRemoved((deviceKey) => recordControllerEvent('disconnect', deviceKey)),
    controllerInputStore.onDiag(recordDiag),
  ];
  controllerEventStore.stop = () => {
    for (const unsubscribe of unsubscribers) unsubscribe();
    controllerEventStore.stop = null;
  };
  return controllerEventStore.stop;
};

export { startControllerEventLog };

/* @layer renderer-lib @kind logic */
import { CONTROLLER_EVENT_KEEP } from './controller-event-log.constants';
import { controllerEventStore } from './controller-event-store';
import type { ControllerEvent, ControllerEventKind } from './controller-event-log.type';

const recordControllerEvent = (kind: ControllerEventKind, text: string): void => {
  controllerEventStore.lastId += 1;
  const event: ControllerEvent = { id: `controller-event-${controllerEventStore.lastId}`, time: Date.now(), kind, text };
  controllerEventStore.events = [...controllerEventStore.events, event].slice(-CONTROLLER_EVENT_KEEP);
  for (const listener of controllerEventStore.listeners) listener();
};

export { recordControllerEvent };

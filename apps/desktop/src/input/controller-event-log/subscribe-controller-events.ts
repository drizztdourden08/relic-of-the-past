/* @layer renderer-lib @kind logic */
import { controllerEventStore } from './controller-event-store';
import type { ControllerEventListener } from './controller-event-log.type';

const subscribeControllerEvents = (listener: ControllerEventListener): (() => void) => {
  controllerEventStore.listeners.add(listener);
  return () => { controllerEventStore.listeners.delete(listener); };
};

export { subscribeControllerEvents };

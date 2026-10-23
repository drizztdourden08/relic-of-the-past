/* @layer renderer-lib @kind logic */
import { controllerEventStore } from './controller-event-store';
import type { ControllerEvent } from './controller-event-log.type';

const getControllerEvents = (): readonly ControllerEvent[] => controllerEventStore.events;

export { getControllerEvents };

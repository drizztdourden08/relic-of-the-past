/* @layer renderer-lib @kind logic */
import type { ControllerEventStore } from './controller-event-log.type';

const controllerEventStore: ControllerEventStore = { events: [], lastId: 0, listeners: new Set(), stop: null };

export { controllerEventStore };

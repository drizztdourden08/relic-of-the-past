/* @layer renderer-lib @kind hook */
import { useEffect, useSyncExternalStore } from 'react';
import { startControllerEventLog } from './controller-event-log';
import { getControllerEvents } from './get-controller-events';
import { subscribeControllerEvents } from './subscribe-controller-events';
import type { ControllerEvent } from './controller-event-log.type';

const useControllerEventLog = (): readonly ControllerEvent[] => {
  useEffect(() => { startControllerEventLog(); }, []);
  return useSyncExternalStore(subscribeControllerEvents, getControllerEvents);
};

export { useControllerEventLog };

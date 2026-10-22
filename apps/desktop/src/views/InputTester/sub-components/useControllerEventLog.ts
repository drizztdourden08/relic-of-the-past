/* @layer renderer-components @kind hook */
import { useState, useEffect, useReducer } from 'react';
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import { controllerInputStore } from '../../../input/controller-input-store';
import { EVENT_LOG_KEEP } from './input-calibration.constants';
import type { EventEntry } from './input-calibration.type';

const useControllerEventLog = (): EventEntry[] => {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const api = inputApi();
    const unsubConnect = api.onAdded((info) => {
      forceUpdate();
      setEvents(prev => [...prev.slice(-EVENT_LOG_KEEP), { time: Date.now(), type: 'connect', id: info.name || info.deviceKey }]);
    });
    const unsubRemoved = api.onRemoved((deviceKey) => {
      setEvents(prev => [...prev.slice(-EVENT_LOG_KEEP), { time: Date.now(), type: 'disconnect', id: deviceKey }]);
    });
    const unsubDisconnect = controllerInputStore.onDisconnect(() => {
      forceUpdate();
    });
    return () => {
      unsubConnect();
      unsubRemoved();
      unsubDisconnect();
    };
  }, []);

  return events;
};

export { useControllerEventLog };

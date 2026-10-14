/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import { useGameUIStore } from '../stores/game-ui-store';
import { createLocationTracker } from './location-notification/create-location-tracker';
import { clearLocationTimers } from './location-notification/clear-location-timers';
import { handleLocationChange } from './location-notification/handle-location-change';
import { notificationsEnabled } from './notifications-enabled';

const useLocationNotification = () => {
  const [tracker] = useState(createLocationTracker);

  useEffect(() => {
    if (!notificationsEnabled()) return;

    const unsub = useGameUIStore.subscribe((state, prevState) => handleLocationChange(tracker, state, prevState));

    return () => {
      unsub();
      clearLocationTimers(tracker);
    };
  }, [tracker]);
};

export { useLocationNotification };

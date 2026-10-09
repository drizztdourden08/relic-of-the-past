/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import type { LocationKey } from '@rotp/randomizer';
import type { CheckId, ItemId } from '@rotp/game-data';
import {
  getCompletedChecks, getCurrentInventory, getEventStatus, onCompletedChecksChanged, onEventStatusChanged, onInventoryChanged,
} from '../../lib/game';
import {
  firedLocations, getSessionState, onFiredLocation, subscribeSessionStore,
} from '../../lib/game/randomizer-client';

const useLiveTrackerInputs = () => {
  const [inventory, setInventory] = useState<Set<ItemId>>(() => getCurrentInventory());
  const [completedChecks, setCompletedChecks] = useState<Set<CheckId>>(() => getCompletedChecks());
  const [eventStatus, setEventStatus] = useState<ReadonlyMap<CheckId, boolean>>(() => new Map(getEventStatus()));
  const [sessionState, setSessionState] = useState(() => getSessionState());
  const [fired, setFired] = useState<ReadonlySet<LocationKey>>(() => firedLocations());

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);
  useEffect(() => onCompletedChecksChanged((checks) => setCompletedChecks(new Set(checks))), []);
  useEffect(() => onEventStatusChanged((status) => setEventStatus(new Map(status))), []);
  useEffect(() => subscribeSessionStore(setSessionState), []);
  useEffect(() => onFiredLocation(() => setFired(new Set(firedLocations()))), []);

  return { inventory, completedChecks, eventStatus, sessionState, fired };
};

export { useLiveTrackerInputs };

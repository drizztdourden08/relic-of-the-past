/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import type { CheckId } from '@rotp/game-data';
import { getEventStatus, onEventStatusChanged } from '../../game/tracker';

const useEventStatus = (): ReadonlyMap<CheckId, boolean> => {
  const [status, setStatus] = useState<ReadonlyMap<CheckId, boolean>>(() => new Map(getEventStatus()));
  useEffect(() => onEventStatusChanged((next) => setStatus(new Map(next))), []);
  return status;
};

export { useEventStatus };

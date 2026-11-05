/* @layer renderer-lib @kind hook */
import { useMemo } from 'react';
import { trackerCheckRecords } from '@rotp/navigation';
import { find } from '@rotp/game-data';
import type { TrackerStatusInputs, TrackerStatuses } from './use-tracker-data.type';
import { snapshotOfReading } from './snapshot-of-reading';

const useTrackerStatuses = ({ placement, reading }: TrackerStatusInputs): TrackerStatuses => {
  const checkRecords = useMemo(() => find('check', () => true), []);
  const effectiveCheckRecords = useMemo(() => trackerCheckRecords(checkRecords, placement), [checkRecords, placement]);
  const snapshot = useMemo(() => snapshotOfReading(effectiveCheckRecords, reading), [effectiveCheckRecords, reading]);

  return { checkRecords, effectiveCheckRecords, snapshot };
};

export { useTrackerStatuses };

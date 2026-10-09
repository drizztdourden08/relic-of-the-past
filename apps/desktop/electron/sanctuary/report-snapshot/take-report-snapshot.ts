/* @layer electron-main @kind logic */
import type { SanctuaryReportSnapshot } from '@app/ipc';
import { SNAPSHOT_TTL_MS } from './report-snapshot.constants';
import { reportSnapshotSlot } from './report-snapshot-slot';

const takeReportSnapshot = (): SanctuaryReportSnapshot | null => {
  const { snapshot, takenAt } = reportSnapshotSlot;
  reportSnapshotSlot.snapshot = null;
  return snapshot && Date.now() - takenAt <= SNAPSHOT_TTL_MS ? snapshot : null;
};

export { takeReportSnapshot };

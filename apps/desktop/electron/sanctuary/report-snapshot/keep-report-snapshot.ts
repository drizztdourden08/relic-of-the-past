/* @layer electron-main @kind logic */
import type { SanctuaryReportSnapshot } from '@app/ipc';
import { reportSnapshotSlot } from './report-snapshot-slot';

const keepReportSnapshot = (snapshot: SanctuaryReportSnapshot): void => {
  reportSnapshotSlot.snapshot = snapshot;
  reportSnapshotSlot.takenAt = Date.now();
};

export { keepReportSnapshot };

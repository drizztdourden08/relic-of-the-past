/* @layer electron-main @kind logic */
import type { SanctuaryReportSnapshot } from '@app/ipc';

const reportSnapshotSlot: { snapshot: SanctuaryReportSnapshot | null; takenAt: number } = { snapshot: null, takenAt: 0 };

export { reportSnapshotSlot };

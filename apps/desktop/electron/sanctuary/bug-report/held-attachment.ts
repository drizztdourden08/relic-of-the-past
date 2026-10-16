/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import type { BuiltReportZip } from './bug-report.type';

let held: BuiltReportZip | null = null;

const attachmentHold = {
  release: async (): Promise<void> => {
    const zip = held;
    held = null;
    if (zip) await rm(zip.path, { force: true });
  },
  hold: async (zip: BuiltReportZip): Promise<void> => {
    await attachmentHold.release();
    held = zip;
  },
  discardUnlessHeld: async (zip: BuiltReportZip): Promise<void> => {
    if (held !== zip) await rm(zip.path, { force: true });
  },
  isHeld: (zip: BuiltReportZip): boolean => held === zip,
};

export { attachmentHold };

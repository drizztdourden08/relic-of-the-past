/* @layer renderer-lib @kind logic */
import { installMsulPack } from '@rotp/msu';
import type { InstallResult } from '@rotp/msu';
import { platformFiles } from '../platform-files';
import { runImportJob } from '../import-job';

const installMsulFile = (bytes: Uint8Array, desiredName?: string): Promise<InstallResult> =>
  runImportJob({
    kind: 'msu',
    title: 'Importing a music pack',
    work: (report) => installMsulPack(platformFiles(), bytes, {
      desiredName,
      onProgress: (done, total) => report.count('copy', done, total),
    }),
  });

export { installMsulFile };

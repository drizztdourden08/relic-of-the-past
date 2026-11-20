/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { alttpMsuConfig, installMsulPack } from '@rotp/msu';
import type { InstallResult } from '@rotp/msu';
import { platformFiles } from '../platform-files';
import { runImportJob } from '../import-job';

const installMsulFile = (bytes: Uint8Array, desiredName?: string): Promise<InstallResult> =>
  runImportJob({
    kind: 'msu',
    title: msg('data-manager:jobs.import-music-pack'),
    work: (report) => installMsulPack(alttpMsuConfig, platformFiles(), bytes, {
      desiredName,
      onProgress: (done, total) => report.count('copy', done, total),
    }),
  });

export { installMsulFile };

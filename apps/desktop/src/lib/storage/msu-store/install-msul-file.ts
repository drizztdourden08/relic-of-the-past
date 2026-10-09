/* @layer renderer-lib @kind logic */
import { installMsulPack } from '@shared/storage/msul/install-msul-pack';
import type { InstallResult } from '@shared/storage/msul/install-msul-pack';
import { platformFiles } from '../platform-files';
import { emitMsuProgress } from './emit-msu-progress';

const installMsulFile = async (bytes: Uint8Array, desiredName?: string): Promise<InstallResult> => {
  const result = await installMsulPack(platformFiles(), bytes, {
    desiredName,
    onProgress: (done, total) => emitMsuProgress('copy', done, total),
  });
  emitMsuProgress('done');
  return result;
};

export { installMsulFile };

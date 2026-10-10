/* @layer root-config @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { filesRepo } from '../../db/files-repo';
import { replaceVersion, versionOf } from '../versions';
import { withPartsDone } from './with-parts-done';

const recordVersionPartsDone = (fileId: string, n: number, partsDone: number): Promise<SanctuaryFile> =>
  filesRepo.mutate(fileId, (latest) => {
    const version = versionOf(latest, n);
    if (version?.status !== 'uploading' || !version.upload) return {};
    return { versions: replaceVersion(latest, { ...version, upload: withPartsDone(version.upload, partsDone) }) };
  });

export { recordVersionPartsDone };

/* @layer root-config @kind logic */
import type { SanctuaryFile } from '../../../../../shared/sanctuary';
import { filesRepo } from '../../db/files-repo';
import { currentVersionOf, replaceVersion } from '../versions';
import { withPartsDone } from './with-parts-done';

const recordFilePartsDone = (fileId: string, partsDone: number): Promise<SanctuaryFile> =>
  filesRepo.mutate(fileId, (latest) => {
    if (latest.status !== 'uploading' || !latest.upload) return {};
    const upload = withPartsDone(latest.upload, partsDone);
    const first = currentVersionOf(latest);
    return { upload, versions: replaceVersion(latest, { ...first, upload }) };
  });

export { recordFilePartsDone };

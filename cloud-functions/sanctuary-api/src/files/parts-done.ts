/* @layer root-config @kind logic */
/** Keeps an upload's progress on its record: the parts the uploader reported up with its
 *  last batch, and when it asked. A first upload carries its upload on the file and on
 *  version 1, so both move together; a later version carries its own. A record no longer
 *  uploading is left alone. */
import type { FileUpload, SanctuaryFile } from '../../../../shared/sanctuary';
import { now } from '../../../hub-core/db/firestore';
import { filesRepo } from '../db/files-repo';
import { currentVersionOf, replaceVersion, versionOf } from './versions';

const progressed = (upload: FileUpload, partsDone: number): FileUpload =>
  ({ ...upload, partsDone: Math.min(partsDone, upload.parts), updatedAt: now() });

const recordFilePartsDone = (fileId: string, partsDone: number): Promise<SanctuaryFile> =>
  filesRepo.mutate(fileId, (latest) => {
    if (latest.status !== 'uploading' || !latest.upload) return {};
    const upload = progressed(latest.upload, partsDone);
    const first = currentVersionOf(latest);
    return { upload, versions: replaceVersion(latest, { ...first, upload }) };
  });

const recordVersionPartsDone = (fileId: string, n: number, partsDone: number): Promise<SanctuaryFile> =>
  filesRepo.mutate(fileId, (latest) => {
    const version = versionOf(latest, n);
    if (!version || version.status !== 'uploading' || !version.upload) return {};
    return { versions: replaceVersion(latest, { ...version, upload: progressed(version.upload, partsDone) }) };
  });

export { recordFilePartsDone, recordVersionPartsDone };

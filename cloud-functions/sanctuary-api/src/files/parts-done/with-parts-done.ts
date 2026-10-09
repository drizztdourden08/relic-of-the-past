/* @layer root-config @kind logic */
import type { FileUpload } from '../../../../../shared/sanctuary';
import { now } from '../../../../hub-core/db/firestore';

const withPartsDone = (upload: FileUpload, partsDone: number): FileUpload =>
  ({ ...upload, partsDone: Math.min(partsDone, upload.parts), updatedAt: now() });

export { withPartsDone };

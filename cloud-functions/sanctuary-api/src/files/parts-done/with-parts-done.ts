/* @layer root-config @kind logic */
import type { FileUpload } from '@rotp/hub-contracts';
import { now } from '@rotp/hub-server';

const withPartsDone = (upload: FileUpload, partsDone: number): FileUpload =>
  ({ ...upload, partsDone: Math.min(partsDone, upload.parts), updatedAt: now() });

export { withPartsDone };

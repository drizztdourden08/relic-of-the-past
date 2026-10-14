/* @layer site-kit @kind logic */
import type { UploadJob } from '@rotp/hub-client';

const offersFollowUp = (followUpLabel: string | null, job: UploadJob | null): boolean =>
  followUpLabel !== null && job !== null && job.fileName !== null && job.phase !== 'failed' && job.followUp !== 'done';

export { offersFollowUp };

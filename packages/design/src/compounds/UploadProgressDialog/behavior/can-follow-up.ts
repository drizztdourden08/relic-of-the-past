/* @layer site-kit @kind logic */
import type { UploadJob } from '@rotp/hub-client';

const canFollowUp = (job: UploadJob | null): boolean => job?.phase === 'done' && job.followUp === 'idle';

export { canFollowUp };

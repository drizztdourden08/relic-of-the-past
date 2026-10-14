/* @layer site-kit @kind logic */
import type { UploadJob } from '@rotp/hub-client';

const jobOf = (jobs: readonly UploadJob[], openId: string | null): UploadJob | null =>
  openId === null ? null : jobs.find((entry) => entry.id === openId) ?? null;

export { jobOf };

/* @layer site-kit @kind hook */
/**
 * Whether the tray shows and whether it is folded to its header. Closing hides it until a
 * newer job arrives; with no job left it is not shown at all.
 */
import { useCallback, useState } from 'react';
import { isFinished } from '../../../upload/upload-queue';
import type { UploadJob } from '../../../upload/upload-job.type';

const useTrayState = (jobs: readonly UploadJob[]) => {
  const newest = jobs[0]?.id ?? null;
  const [closedAt, setClosedAt] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const close = useCallback(() => setClosedAt(newest), [newest]);
  const toggle = useCallback(() => setCollapsed((current) => !current), []);
  const running = jobs.filter((job) => !isFinished(job) && job.phase !== 'queued' && job.phase !== 'needs-file').length;
  return {
    shown: newest !== null && closedAt !== newest,
    collapsed,
    toggle,
    close,
    count: jobs.length,
    running,
    anyFinished: jobs.some(isFinished),
  };
};

type TrayState = ReturnType<typeof useTrayState>;

export { useTrayState };
export type { TrayState };

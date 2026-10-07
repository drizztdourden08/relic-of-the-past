/* @layer sanctuary-site @kind hook */
/**
 * Whether the uploads panel is open. It opens by itself whenever a new upload starts, and
 * on arrival while one is still moving; the close hides it until the next upload. With no
 * rows left it is not shown at all.
 */
import { useCallback, useState } from 'react';
import type { UploadJob } from '../../../upload/upload-job.type';
import { isFinished } from '../../../upload/useMultipartUpload';

const idsOf = (jobs: readonly UploadJob[]) => jobs.map((job) => job.id).join(' ');

const useUploadsPanel = (jobs: readonly UploadJob[]) => {
  const [open, setOpen] = useState(() => jobs.some((job) => !isFinished(job)));
  const [known, setKnown] = useState(() => idsOf(jobs));

  // A row the panel has not seen yet is a new upload: open. Adjusted during render, the
  // way React derives state from a changed prop.
  const ids = idsOf(jobs);
  if (ids !== known) {
    const before = new Set(known.split(' '));
    setKnown(ids);
    if (jobs.some((job) => !before.has(job.id))) setOpen(true);
  }

  const show = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return { isOpen: open && jobs.length > 0, count: jobs.length, show, close };
};

type UploadsPanelState = ReturnType<typeof useUploadsPanel>;

export { useUploadsPanel };
export type { UploadsPanelState };

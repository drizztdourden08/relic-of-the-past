/* @layer renderer-components @kind types */
import type { ReferencedByHit } from '../RecordEditor';

interface DeleteGuardDialogProps {
  open: boolean;
  /** What is being deleted, for the message line — e.g. "the tag barrier:small-key". */
  subjectLabel: string;
  /** What still points at it. Always non-empty when `open` is true — an empty
   *  list is the caller's cue to delete immediately with no dialog at all. */
  hits: readonly ReferencedByHit[];
  /** Set when a confirmed delete came back refused — shown in place of the
   *  reference breakdown, since the write itself is what needs explaining now. */
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export type { DeleteGuardDialogProps };

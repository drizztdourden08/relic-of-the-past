/* @layer sanctuary-site @kind types */
import type { SameNameQuestion } from '../behavior/drop-queue';

type SameNameDialogProps = {
  question: SameNameQuestion | null;
  onSeparate: () => void;
  onVersion: () => void;
  onClose: () => void;
};

export type { SameNameDialogProps };

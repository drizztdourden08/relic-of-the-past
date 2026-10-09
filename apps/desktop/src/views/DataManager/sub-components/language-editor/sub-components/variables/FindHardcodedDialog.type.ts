/* @layer renderer-components @kind types */
import type { HardcodedGroup } from '../../behavior/hardcoded-report';

type FindHardcodedDialogProps = {
  open: boolean;
  groups: HardcodedGroup[];
  onApply: (variableKeys: string[]) => void;
  onClose: () => void;
};

export type { FindHardcodedDialogProps };

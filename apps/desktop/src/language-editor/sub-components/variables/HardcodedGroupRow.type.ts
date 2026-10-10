/* @layer renderer-components @kind types */
import type { HardcodedGroup } from '../../behavior/hardcoded-report';

type HardcodedGroupRowProps = {
  group: HardcodedGroup;
  checked: boolean;
  onToggle: (variableKey: string, checked: boolean) => void;
};

export type { HardcodedGroupRowProps };

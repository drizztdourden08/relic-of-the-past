/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { StarterRole } from '../../../behavior/formula-starters';

interface FormulaMenuProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  filter: string;
  role: StarterRole;
  insideRepeat: boolean;
  extraNames?: readonly string[];
  scope: Readonly<Record<string, number>>;
  onClose: () => void;
  onInsert: (snippet: string, select?: string) => void;
}

export type { FormulaMenuProps };

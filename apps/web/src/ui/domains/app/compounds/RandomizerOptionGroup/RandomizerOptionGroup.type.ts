/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface RandomizerOptionGroupProps {
  title: string;
  /** The rows are the player's own choices, not a fixed section. */
  live?: boolean;
  /** Present makes the group fold behind its title. */
  onToggle?: () => void;
  /** Read only with `onToggle`; a plain group is always open. */
  open?: boolean;
  /** Row count shown on a folding title. */
  count?: number;
  className?: string;
  children?: ReactNode;
}

export type { RandomizerOptionGroupProps };

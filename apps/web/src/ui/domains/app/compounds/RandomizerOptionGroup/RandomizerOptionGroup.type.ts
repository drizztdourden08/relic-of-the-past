/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface RandomizerOptionGroupProps {
  title: string;
  /** The rows are the player's own choices, not a fixed section. */
  live?: boolean;
  className?: string;
  children?: ReactNode;
}

export type { RandomizerOptionGroupProps };

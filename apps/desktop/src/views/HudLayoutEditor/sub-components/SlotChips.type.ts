/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface SlotChipsProps {
  label: string;
  value: readonly number[] | undefined;
  onChange: (next: number[] | undefined) => void;
  hint?: ReactNode;
  readOnly?: boolean;
}

export type { SlotChipsProps };

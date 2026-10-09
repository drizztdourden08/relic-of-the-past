/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { StarterRole } from '../../behavior/formula-starters';
import type { Value } from '@shared/types/hud';

interface ValueInputProps {
  label?: string;
  value: Value | undefined;
  onChange: (next: Value) => void;
  onClear?: () => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  extraNames?: readonly string[];
  role?: StarterRole;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  hint?: ReactNode;
  readOnly?: boolean;
  derivedFrom?: string;
  className?: string;
  'aria-label'?: string;
}

export type { ValueInputProps };

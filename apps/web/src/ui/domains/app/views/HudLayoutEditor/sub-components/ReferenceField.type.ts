/* @layer renderer-components @kind types */
import type { ReactNode, RefObject } from 'react';

interface ReferenceFieldProps {
  label?: string;
  hint?: ReactNode;
  src?: string;
  placeholder?: string;
  specimen?: ReactNode;
  name: string;
  kind?: string;
  action?: 'pick' | 'go';
  compact?: boolean;
  onOpen: () => void;
  anchorRef?: RefObject<HTMLButtonElement | null>;
  children?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

export type { ReferenceFieldProps };

/* @layer renderer-components @kind types */
import type { ReactNode, RefObject } from 'react';
import type { IconName } from '@drizztdourden08/tessera/primitives';

interface ReferenceFieldProps {
  label?: string;
  hint?: ReactNode;
  src?: string;
  placeholder?: IconName;
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

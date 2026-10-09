/* @layer renderer-components @kind types */
import type { HTMLAttributes, ReactNode } from 'react';

type SaveCardVariant = 'row' | 'feature';

interface SaveCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SaveCardVariant;
  busy?: boolean;
  thumb?: ReactNode;
  actions?: ReactNode;
}

export type { SaveCardVariant, SaveCardProps };

/* @layer site-kit @kind types */
import type { HTMLAttributes, ReactNode } from 'react';

type ChipTone = 'neutral' | 'gold' | 'green' | 'info' | 'warning' | 'danger' | 'muted';

type ChipProps = HTMLAttributes<HTMLElement> & {
  tone?: ChipTone;
  href?: string;
  className?: string;
  children?: ReactNode;
};

export type { ChipProps, ChipTone };

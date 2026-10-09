/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface HeroProps {
  ariaLabel: string;
  backdrop?: ReactNode;
  art?: ReactNode;
  tools?: ReactNode;
  intro: ReactNode;
  side?: ReactNode;
  bottom?: ReactNode;
  className?: string;
}

export type { HeroProps };

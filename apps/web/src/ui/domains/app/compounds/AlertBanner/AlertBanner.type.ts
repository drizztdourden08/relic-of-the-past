/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface AlertBannerProps {
  /** The one thing the banner has to say. Keep it to a sentence. */
  children: ReactNode;
  className?: string;
}

export type { AlertBannerProps };

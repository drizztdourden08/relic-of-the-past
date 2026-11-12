/* @layer website-site @kind types */
import type { ReactNode } from 'react';

type ShotFrameProps = {
  caption: string;
  framed?: boolean;
  className?: string;
  children: ReactNode;
};

export type { ShotFrameProps };

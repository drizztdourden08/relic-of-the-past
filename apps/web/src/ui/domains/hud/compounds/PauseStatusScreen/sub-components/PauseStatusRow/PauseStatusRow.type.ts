/* @layer renderer-hud @kind types */
import type { ReactNode } from 'react';

interface PauseStatusRowProps {
  label: string;
  top: number;
  valueTop?: number;
  scale: number;
  spritesBase: string;
  children?: ReactNode;
}

export type { PauseStatusRowProps };

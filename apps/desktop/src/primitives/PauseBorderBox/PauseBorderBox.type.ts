/* @layer renderer-hud @kind types */
import type { CSSProperties, ReactNode } from 'react';

interface PauseBorderBoxProps {
  color: 'green' | 'blue' | 'gray' | 'yellow' | 'red';
  cols: number;
  rows: number;
  scale: number;
  spritesBase: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export type { PauseBorderBoxProps };

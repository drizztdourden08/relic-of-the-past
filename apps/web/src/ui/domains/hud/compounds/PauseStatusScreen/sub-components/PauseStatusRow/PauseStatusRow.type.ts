/* @layer renderer-hud @kind types */
import type { ReactNode } from 'react';

interface PauseStatusRowProps {
  label: string;
  /** Row top in SNES pixels, from the panel's content origin. */
  top: number;
  /** Nudge for a value shorter than a full cell, so it centres on the label. */
  valueTop?: number;
  scale: number;
  spritesBase: string;
  children?: ReactNode;
}

export type { PauseStatusRowProps };

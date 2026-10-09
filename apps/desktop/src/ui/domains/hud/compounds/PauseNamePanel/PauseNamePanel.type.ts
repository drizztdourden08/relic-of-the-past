/* @layer renderer-hud @kind types */
import type { CSSProperties } from 'react';

interface PauseNamePanelProps {
  itemName: string | string[];
  itemSprite: string | null;
  borderColor?: 'green' | 'blue' | 'gray' | 'yellow' | 'red';
  scale: number;
  spritesBase: string;
  style?: CSSProperties;
}

interface NameGlyphProps {
  char: string;
  size: number;
  spritesBase: string;
}

interface NameLineProps {
  line: string;
  glyphSize: number;
  spritesBase: string;
}

export type { NameGlyphProps, NameLineProps, PauseNamePanelProps };

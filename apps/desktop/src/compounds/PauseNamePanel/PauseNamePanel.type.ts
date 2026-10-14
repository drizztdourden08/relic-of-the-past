/* @layer renderer-hud @kind types */
interface PauseNamePanelProps {
  itemName: string | string[];
  itemSprite: string | null;
  borderColor?: 'green' | 'blue' | 'gray' | 'yellow' | 'red';
  scale: number;
  spritesBase: string;
  className?: string;
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

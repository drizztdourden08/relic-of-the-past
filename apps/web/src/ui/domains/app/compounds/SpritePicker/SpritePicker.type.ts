/* @layer renderer-components @kind types */
import type { ReactNode, RefObject } from 'react';

interface SpritePickerTile {
  file: string;
  label: string;
  category: string;
}

interface SpritePickerProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  sprites: readonly SpritePickerTile[];
  categories: readonly string[];
  categoryLabels: Record<string, string>;
  spriteUrl: (file: string) => string;
  onPick: (file: string) => void;
  onClose: () => void;
  notice?: ReactNode;
}

export type { SpritePickerProps, SpritePickerTile };

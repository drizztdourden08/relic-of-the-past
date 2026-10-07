/* @layer renderer-components @kind types */
import type { ReactNode, RefObject } from 'react';

interface SpritePickerTile {
  /** Filename without extension. This is the value handed to `onPick`. */
  file: string;
  label: string;
  category: string;
}

interface SpritePickerProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  /** Every pickable sprite, already flattened. No store, no manifest import here. */
  sprites: readonly SpritePickerTile[];
  /** Category ids, in display order; only ones actually present in `sprites` are shown as tabs. */
  categories: readonly string[];
  categoryLabels: Record<string, string>;
  /** Resolves a tile's own `<img src>`. Always called, regardless of any
   *  extraction state. A missing PNG 404s and `Thumbnail` falls back to its
   *  own placeholder per tile; nothing here decides that in bulk. */
  spriteUrl: (file: string) => string;
  onPick: (file: string) => void;
  onClose: () => void;
  /** Content rendered above the tiles, such as an "extraction incomplete" notice with its
   *  own action. A prop, never a store: the composite stays presentational and
   *  the caller (a View) decides what, if anything, belongs here. */
  notice?: ReactNode;
}

export type { SpritePickerProps, SpritePickerTile };

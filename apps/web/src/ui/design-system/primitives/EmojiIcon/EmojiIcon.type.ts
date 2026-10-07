/* @layer renderer-components @kind types */
import type { HTMLAttributes } from 'react';

type EmojiIconSize = 'sm' | 'md' | 'lg';

interface EmojiIconProps extends HTMLAttributes<HTMLSpanElement> {
  /** The emoji character(s) to draw. */
  glyph: string;
  /** Type-scale step the glyph is drawn at. */
  size?: EmojiIconSize;
}

export type { EmojiIconProps, EmojiIconSize };

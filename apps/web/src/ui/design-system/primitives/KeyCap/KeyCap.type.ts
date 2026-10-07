/* @layer renderer-components @kind types */
import type { HTMLAttributes } from 'react';

/** `sm` is the legend's own size, for a cap that sits inside a 16px text line. */
type KeyCapSize = 'sm' | 'md';

interface KeyCapProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** What is printed on the cap: `Ctrl`, `⌘`, `⇧`, `←`, `Del`, `Esc`, `Enter`. */
  label: string;
  size?: KeyCapSize;
  /** Spoken form, when the printed label is a glyph a reader cannot say aloud. */
  title?: string;
  className?: string;
}

export type { KeyCapProps, KeyCapSize };

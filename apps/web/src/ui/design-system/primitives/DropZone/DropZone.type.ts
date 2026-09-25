/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

/** `block` is the tall target; `inline` is a one-line dashed box that fills a header row's height. */
type DropZoneVariant = 'block' | 'inline';

interface DropZoneProps {
  accept?: string[];
  label?: string;
  hint?: string;
  disabled?: boolean;
  /** Defaults to `block`. */
  variant?: DropZoneVariant;
  /** Replaces the default glyph. */
  icon?: ReactNode;
  onDrop: (files: File[]) => void;
}

export type {
  DropZoneProps,
  DropZoneVariant,
};

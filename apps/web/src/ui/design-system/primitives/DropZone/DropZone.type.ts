/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

/** `block` is the tall target; `inline` is a one-line dashed box that fills a header row's height. */
type DropZoneVariant = 'block' | 'inline';

/** A line shown inside the zone about what it holds: green when the file is right, red when not. */
type DropZoneStatus = { tone: 'success' | 'error'; message: ReactNode };

interface DropZoneProps {
  accept?: string[];
  label?: string;
  hint?: string;
  disabled?: boolean;
  /** Defaults to `block`. */
  variant?: DropZoneVariant;
  /** Replaces the default glyph. */
  icon?: ReactNode;
  /** Shown inside the zone under its label. */
  status?: DropZoneStatus;
  onDrop: (files: File[]) => void;
}

export type {
  DropZoneProps,
  DropZoneStatus,
  DropZoneVariant,
};

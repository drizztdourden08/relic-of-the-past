/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface WindowHeaderProps {
  /** Window title, shown gold + uppercase on the left. */
  title?: ReactNode;
  /** Plain-case text after the title, e.g. which profile the window belongs to. */
  subtitle?: ReactNode;
  /** Invoked by the close ✕ button (omit to hide the button). */
  onClose?: () => void;
  /** Optional content between the title and the close ✕. */
  extra?: ReactNode;
  className?: string;
}

export type { WindowHeaderProps };

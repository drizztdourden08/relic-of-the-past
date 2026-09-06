/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface DisabledOverlayProps {
  /** When true, renders the disabled-state scrim over `children` instead of them alone. */
  active: boolean;
  /** Scrim message; defaults to the standard Vanilla Safe copy. */
  message?: string;
  /** Use the inward-inset scrim instead of the default outward overhang. Pick this when the
   *  anchor sits inside an `overflow: hidden`/`auto` ancestor, or flush against a neighboring
   *  row with no gap to bleed into. The default overhang would otherwise get clipped by the
   *  ancestor or spill onto adjacent, still-enabled content. */
  contained?: boolean;
  /** Label for the action that deep-links back to the setting that caused the lock. */
  actionLabel?: string;
  /** Invoked when the action is activated. The caller owns navigation. This component
   *  never imports a store or router; it only fires the callback it's given.
   *  OMIT it for a lock nothing can undo from here: the scrim then states the cause
   *  without offering an action that would go nowhere. */
  onOpenSettings?: () => void;
  children: ReactNode;
  className?: string;
}

export type { DisabledOverlayProps };

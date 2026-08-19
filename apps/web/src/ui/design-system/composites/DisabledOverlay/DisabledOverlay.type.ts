/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface DisabledOverlayProps {
  /** When true, renders the disabled-state scrim over `children` instead of them alone. */
  active: boolean;
  /** Scrim message; defaults to the standard Vanilla Safe copy. */
  message?: string;
  /** Use the inward-inset scrim instead of the default outward overhang. Pick this when the
   *  anchor sits inside an `overflow: hidden`/`auto` ancestor, or flush against a neighboring
   *  row with no gap to bleed into — the default overhang would otherwise get clipped by the
   *  ancestor or visibly spill onto adjacent, still-enabled content. */
  contained?: boolean;
  /** Label for the action that deep-links back to the setting that caused the lock. */
  actionLabel?: string;
  /** Invoked when the action is activated. The caller owns navigation — this component
   *  never imports a store or router, it only ever fires the callback it's given. */
  onOpenSettings: () => void;
  children: ReactNode;
  className?: string;
}

export type { DisabledOverlayProps };

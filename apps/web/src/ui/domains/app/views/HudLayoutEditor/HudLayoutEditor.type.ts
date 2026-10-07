/* @layer renderer-components @kind types */
import type { HudLayout } from '@shared/types/hud';

interface HudLayoutEditorProps {
  /**
   * The layout to open. Omitted from the Advanced menu, where the answer is
   * "whatever the active scheme is wearing". The editor reads that from the
   * layout store so the caller does not have to look it up.
   */
  layoutId?: string;
  onClose: () => void;
  /** Fired after a successful save, with the layout that was written. The
   *  editor has already pointed the live HUD and the edited scheme at it. */
  onCommitted?: (layout: HudLayout) => void;
}

export type { HudLayoutEditorProps };

/* @layer renderer-components @kind types */
import type { HudLayout } from '@shared/types/hud';

interface PresetBarProps {
  layouts: readonly HudLayout[];
  draft: HudLayout;
  dirty: boolean;
  busy: boolean;
  errors: readonly string[];
  onStartFrom: (layout: HudLayout) => void;
  onRename: (name: string) => void;
  onSave: () => void;
  onSaveAs: () => void;
  onReset: () => void;
}

export type { PresetBarProps };

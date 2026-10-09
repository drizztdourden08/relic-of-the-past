/* @layer renderer-components @kind types */
import type { HudLayout } from '@shared/types/hud';

interface LayoutDraft {
  draft: HudLayout | null;
  apply: (change: (doc: HudLayout) => HudLayout) => void;
  layouts: readonly HudLayout[];
  dirty: boolean;
  busy: boolean;
  rename: (name: string) => void;
  setGlyphPack: (glyphPack: string) => void;
  startFrom: (layout: HudLayout) => void;
  reset: () => void;
  save: () => Promise<HudLayout | null>;
  saveAs: (name: string) => Promise<HudLayout | null>;
}

export type { LayoutDraft };

/* @layer renderer-stores @kind types */
import type { HudLayout } from '@shared/types/hud';

interface HudLayoutStore {
  layout: HudLayout;
  layoutId: string;
  setLayoutId: (id: string) => void;
  setLayout: (layout: HudLayout) => void;
}

export type { HudLayoutStore };

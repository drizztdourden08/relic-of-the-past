/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { DEFAULT_LAYOUT } from '@shared/hud/layouts';
import type { HudLayoutStore } from './hud-layout-store.type';
import { resolveLayout } from './resolveLayout';

const useHudLayoutStore = create<HudLayoutStore>()((set) => ({
  layout: DEFAULT_LAYOUT,
  layoutId: DEFAULT_LAYOUT.id,
  setLayoutId: (id) => set({ layoutId: id, layout: resolveLayout(id) }),
  setLayout: (layout) => set({ layout, layoutId: layout.id }),
}));

export { useHudLayoutStore };

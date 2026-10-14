/* @layer renderer-stores @kind logic */
import type { HeightLevelActions, ShadowEditorSet } from './shadow-editor-store.type';

const heightLevelActions = (set: ShadowEditorSet): HeightLevelActions => ({
  addHeightLevel: (label, value) => set((s) => ({ heightLevels: [...s.heightLevels, { label, value }] })),
  removeHeightLevel: (index) => set((s) => ({ heightLevels: s.heightLevels.filter((_, i) => i !== index) })),
  updateHeightLevel: (index, patch) => set((s) => ({
    heightLevels: s.heightLevels.map((l, i) => i === index ? { ...l, ...patch } : l),
  })),
});

export { heightLevelActions };

/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { HudEditorViewStore } from './hud-editor-view-store.type';
import { EDITOR_STEPS } from './hud-editor-view-store.constants';
import { sameEcho } from './same-echo';

const useHudEditorViewStore = create<HudEditorViewStore>()((set) => ({
  gridOverlayEnabled: false,
  snappingEnabled: false,
  collapsedNodeIds: new Set(),
  gridEcho: null,
  flexEcho: null,
  editorStep: EDITOR_STEPS[0] ?? 1,
  toggleGridOverlay: () => set((s) => ({ gridOverlayEnabled: !s.gridOverlayEnabled })),
  toggleSnapping: () => set((s) => ({ snappingEnabled: !s.snappingEnabled })),
  toggleNodeCollapsed: (id) => set((s) => {
    const next = new Set(s.collapsedNodeIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    return { collapsedNodeIds: next };
  }),
  expandNodeIds: (ids) => set((s) => {
    if (ids.every((id) => !s.collapsedNodeIds.has(id))) return s;
    const next = new Set(s.collapsedNodeIds);
    ids.forEach((id) => next.delete(id));
    return { collapsedNodeIds: next };
  }),
  collapseNodeIds: (ids) => set((s) => {
    if (ids.every((id) => s.collapsedNodeIds.has(id))) return s;
    const next = new Set(s.collapsedNodeIds);
    ids.forEach((id) => next.add(id));
    return { collapsedNodeIds: next };
  }),
  setGridEcho: (echo) => set((s) => (sameEcho.grid(s.gridEcho, echo) ? s : { gridEcho: echo })),
  setFlexEcho: (echo) => set((s) => (sameEcho.flex(s.flexEcho, echo) ? s : { flexEcho: echo })),
  setEditorStep: (step) => set({ editorStep: EDITOR_STEPS.includes(step) ? step : 1 }),
}));

export { useHudEditorViewStore };

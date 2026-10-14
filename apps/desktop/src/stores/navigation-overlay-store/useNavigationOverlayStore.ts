/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { NavigationOverlayState } from './navigation-overlay-store.type';

const useNavigationOverlayStore = create<NavigationOverlayState>((set) => ({
  visible: false,
  mode: 'manual',
  screenBundle: null,
  result: null,
  results: [],
  connections: [],
  fallHoleSpawns: [],
  respawnEntIds: new Set(),
  crossings: [],
  annotations: [],
  hiddenKinds: new Set<string>(),
  lockedTarget: null,
  lockedPath: null,
  setVisible: (visible) => set({ visible }),
  setMode: (mode) => set({ mode }),
  setScreenBundle: (screenBundle) => set({ screenBundle }),
  setData: (params) => {
    const { result, connections, results, fallHoleSpawns, respawnEntIds } = params;
    set({ result, connections, results: results ?? [result], fallHoleSpawns: fallHoleSpawns ?? [], respawnEntIds: respawnEntIds ?? new Set(), visible: true });
  },
  setAnnotations: (annotations) => set({ annotations }),
  setCrossings: (crossings) => set({ crossings }),
  toggleKind: (kind) => set((s) => {
    const next = new Set(s.hiddenKinds);
    if (next.has(kind)) next.delete(kind);
    else next.add(kind);
    return { hiddenKinds: next };
  }),
  setLockedTarget: (tile) => set({ lockedTarget: tile }),
  setLockedPath: (path) => set({ lockedPath: path }),
  clear: () => set({ result: null, results: [], connections: [], fallHoleSpawns: [], respawnEntIds: new Set(), crossings: [], annotations: [], screenBundle: null, visible: false, lockedTarget: null, lockedPath: null }),
}));

export { useNavigationOverlayStore };

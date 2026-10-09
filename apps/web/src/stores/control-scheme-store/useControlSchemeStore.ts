/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { setSchemeAssignments } from '@app/lib/input/scheme-runtime';
import type { Assignments, ControlSchemeStore } from './control-scheme-store.type';
import { persistAssignments } from './persistAssignments';

const commit = (set: (patch: Partial<ControlSchemeStore>) => void, assignments: Assignments): void => {
  set({ assignments });
  setSchemeAssignments({ assignments });
  persistAssignments(assignments);
};

const useControlSchemeStore = create<ControlSchemeStore>()((set, get) => ({
  scheme: 'classic',
  bindings: null,
  assignments: {},
  setAssignment: (slot, assignment) => commit(set, { ...get().assignments, [slot]: assignment }),
  clearAssignment: (slot) => {
    const { [slot]: _dropped, ...rest } = get().assignments;
    commit(set, rest);
  },
  _sync: (next) => set(next),
}));

export { useControlSchemeStore };

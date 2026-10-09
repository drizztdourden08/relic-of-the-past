/* @layer renderer-stores @kind types */
import type { GameSettings } from '@shared/types/settings';
import type { ControlSchemeId } from '@shared/input/scheme';
import type { ModernBindings, SlotAssignment, SlotIndex } from '@rotp/game-data';

type Assignments = Record<SlotIndex, SlotAssignment>;

interface ControlSchemeStore {
  scheme: ControlSchemeId;
  bindings: ModernBindings | null;
  assignments: Assignments;
  setAssignment: (slot: SlotIndex, assignment: SlotAssignment) => void;
  clearAssignment: (slot: SlotIndex) => void;
  _sync: (next: Partial<ControlSchemeStore>) => void;
}

interface ControlSettingsMemo {
  lastApplied: GameSettings | null;
}

export type { Assignments, ControlSchemeStore, ControlSettingsMemo };

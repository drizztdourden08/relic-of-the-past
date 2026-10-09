/* @layer shared-game @kind types */
import type { SlotAssignment, SlotIndex } from '@shared/types/controls/scheme';

type PauseScreen = 'items' | 'gear' | 'status';
type PauseSection =
  | 'items' | 'bottles' | 'sword' | 'shield' | 'mail' | 'bow' | 'passive' | 'actions';

type PauseState =
  | { phase: 'closed' }
  | { phase: 'browsing'; screen: PauseScreen; section: PauseSection; cursor: number }
  | { phase: 'closing'; via: 'continue' | 'save-quit' };

type BrowsingState = Extract<PauseState, { phase: 'browsing' }>;

type PauseEvent =
  | { type: 'opened' } | { type: 'closed' } | { type: 'pause' }
  | { type: 'move'; dir: 'up' | 'down' | 'left' | 'right' }
  | { type: 'confirm' } | { type: 'cancel' }
  | { type: 'prevScreen' } | { type: 'nextScreen' }
  | { type: 'slot'; slot: SlotIndex }
  | { type: 'focus'; screen: PauseScreen; section: PauseSection; cursor: number }
  | { type: 'screen'; screen: PauseScreen };

interface PauseContext {
  owned: readonly boolean[];
  bottles: readonly number[];
  gear: { sword: number; shield: number; mail: number; bow?: number };
  ownedMax: { sword: number; shield: number; mail: number; bow?: number };
  activeItem?: number;
}

type AssignTarget =
  | { kind: 'item'; hudItem: number }
  | { kind: 'sword' }
  | { kind: 'action' };

type AssignPlan =
  | { outcome: 'ignored' }
  | { outcome: 'refused' }
  | { outcome: 'assign'; target: AssignTarget; clear: readonly SlotIndex[] };

type PauseNameKey =
  | { kind: 'item'; recordId: string; tier: number }
  | { kind: 'bottle'; value: number };

interface ItemCell {
  hudItem: number;
  saveIndex: number;
  sprite: string;
  owned: boolean;
  nameKey: PauseNameKey;
}

type GearKind = 'sword' | 'shield' | 'mail';
type GearLadderKind = GearKind | 'bow';

interface GearTierCell {
  kind: GearLadderKind;
  tier: number;
  sprite: string;
  owned: boolean;
}

interface RowSegment {
  section: PauseSection;
  start: number;
  length: number;
  column: number;
}

interface CursorPos {
  section: PauseSection;
  cursor: number;
}

interface RowCell {
  section: PauseSection;
  cursor: number;
  column: number;
}

interface GridPoint {
  row: number;
  column: number;
}

type ConfirmTarget =
  | { kind: 'equip'; gear: GearLadderKind; tier: number }
  | { kind: 'unequip'; gear: GearKind }
  | { kind: 'exit'; via: 'continue' | 'save-quit' };

type ConfirmVerb = ConfirmTarget['kind'];

type ConfirmPlan =
  | { outcome: 'ignored' }
  | { outcome: 'refused' }
  | { outcome: 'equip'; gear: GearLadderKind; tier: number }
  | { outcome: 'exit'; via: 'continue' | 'save-quit' };

type SlotAssignments = Readonly<Record<SlotIndex, SlotAssignment>>;

export type {
  AssignPlan, AssignTarget, BrowsingState, ConfirmPlan, ConfirmTarget, ConfirmVerb, CursorPos, GearKind,
  GearLadderKind, GearTierCell, GridPoint, ItemCell, PauseContext, PauseEvent, PauseNameKey, PauseScreen,
  PauseSection, PauseState, RowCell, RowSegment, SlotAssignments,
};

/* @layer shared-types @kind types */
/**
 * Binding model for the modern control scheme.
 *
 * Two halves, deliberately separate:
 *  - CoreBindings holds the ten verbs that are never assignable: the four
 *    directions, pause, map, and the four menu verbs. They exist under both
 *    schemes, because the enhanced pause menu is driven the same way either
 *    way.
 *  - ModernSlot[] is an ORDERED, OPEN-ENDED list the player builds. What a slot
 *    DOES is a separate, per-save decision (ModernScheme.assignments), so
 *    re-binding a slot never disturbs what it was assigned, and assigning never
 *    disturbs what physically fires it.
 *
 * A SLOT IS A NUMBER. `index` is 1, 2, 3 and so on, and it is the whole identity: it is
 * never derived from the device and never derived from a button position. The
 * control scheme says what slot 3 is bound to and the HUD layout says where
 * slot 3 is drawn; they are joined by that number and by nothing else, so
 * either side can be re-authored without disturbing the other. Rebinding slot 3
 * from B to X changes what slot 3 IS while the item on it and its place in the
 * HUD both stay put.
 *
 * That reverses the position-derived ids of contract §11 (`slot:NORTH`) and the
 * face-and-d-pad-only cap of §15, and it is the better answer for the same
 * reason: numbering survives a rebind just as directly, and it carries no cap,
 * so a thirty-button pad is thirty slots and a keyboard is as many as the
 * player cares to add. See §19.
 *
 * `position` and `icon` are DISPLAY ONLY. They say which glyph to draw, and which
 * device's artwork to draw it from. `binding` is what the player physically
 * presses. Nothing requires the two to describe the same device: a slot may
 * say "I am the NORTH button" for every visual purpose while actually reading
 * the `W` key.
 */
import type { SdlAxisName, SdlButtonName } from '../../input/sdl-buttons';
import type { ButtonIcon, InputBinding } from './bindings';

/** 1, 2, 3 and up. A slot's whole identity, on both sides of the join. */
type SlotIndex = number;

/** What a slot fires. `hudItem` is a core new-style hud item id, 1..24. */
type SlotAssignment =
  | { kind: 'none' }
  | { kind: 'sword' }
  | { kind: 'action' }
  | { kind: 'item'; hudItem: number };

interface CoreBindings {
  up: InputBinding; down: InputBinding; left: InputBinding; right: InputBinding;
  pause: InputBinding; map: InputBinding;
  confirm: InputBinding; cancel: InputBinding; prevScreen: InputBinding; nextScreen: InputBinding;
}

interface ModernSlot {
  /** 1-based, contiguous, and the only identity. Never derived from anything. */
  index: SlotIndex;
  /** What the player presses. `{ type: 'none' }` for a slot that is still empty.
   *  An empty slot still EXISTS and still keeps its number, because that is
   *  how a player sees there is a free button to fill. */
  binding: InputBinding;
  /** Display only: which glyph the cluster draws. Absent draws from the binding. */
  position?: SdlButtonName | SdlAxisName;
  label: string;
  /** Display only: the device artwork resolved for this control, when known. */
  icon?: ButtonIcon | null;
}

/** The slot list is ORDERED and OPEN-ENDED; its length is the player's choice,
 *  never a function of the device. */
interface ModernBindings {
  core: CoreBindings;
  slots: ModernSlot[];
  /**
   * The HUD layout this scheme WEARS, by id.
   *
   * It lives here instead of in a global HUD setting because it is a property
   * of the control scheme: switching the active control profile from the
   * keyboard to a pad swaps the slot list, the assignments and the HUD layout
   * together, in one step, and the key-cap HUD becomes the pad HUD without the
   * player opening the HUD settings at all.
   *
   * Prefilled when a controller is dropped, and fully editable afterwards. Two
   * schemes naming the same id share one layout, so editing it edits it for both,
   * and "duplicate layout" in the editor is how one of them forks. Absent means
   * "the shipped default", so an old profile needs no migration.
   */
  layoutId?: string;
}

/** Per-save assignment table, keyed by slot NUMBER. A slot with no entry is
 *  unassigned; an empty table is the valid "nothing assigned yet" default. */
interface ModernScheme {
  assignments: Record<SlotIndex, SlotAssignment>;
}

export type { CoreBindings, ModernBindings, ModernScheme, ModernSlot, SlotAssignment, SlotIndex };

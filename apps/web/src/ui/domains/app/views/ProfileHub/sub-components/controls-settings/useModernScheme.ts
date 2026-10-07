/* @layer renderer-components @kind hook */
/**
 * useModernScheme is the scheme half of the controls screen.
 *
 * THE SLOT LIST IS THE PLAYER'S, and this is where they build it. It is stored
 * on the profile, prefilled from the device the first time one is dropped on,
 * and thereafter added to, removed from and re-bound here. There is one row per slot,
 * numbered "Slot 1", "Slot 2" and so on, with no cap and no category filter, so a
 * thirty-button pad is thirty rows and a keyboard is as many as the player
 * wants (contract §19).
 *
 * That reverses the old rule, which derived the list on every read from the
 * live device filtered to two categories. Deriving is what made the list
 * uneditable: anything the player added would be recomputed away on the next
 * render, and anything the device did not report could never be added at all.
 *
 * THE HUD LAYOUT THIS SCHEME WEARS sits on the same profile beside the slot
 * list (`modern.layoutId`) and is edited by `useSchemeLayout`; every write
 * here carries it through untouched instead of rebuilding the modern block,
 * so a slot edit can never move the player's HUD back to the default.
 *
 * WHAT A SLOT FIRES still lives in settings (`modernScheme.assignments`), keyed
 * by the slot NUMBER, and is never pruned here. Removing a slot closes the gap,
 * so the assignments below it move up with the numbering. `remapAssignments`
 * is that move, and it is why a removal writes both halves in one go.
 *
 * THE SCHEME IS READ, NEVER SET. It is derived from the HUD style
 * (`controlSchemeOf`), so there is no setter here and no moment at which
 * "switching to Modern" builds a profile's modern bindings. Nothing was lost
 * with that trigger: `coreBindings` falls back to the device's defaults and
 * `effectiveSlots` prefills the list from the device, so a profile that has
 * never carried a `modern` block lists its slots the first time it is opened.
 */
import { useCallback, useMemo } from 'react';
import {
  addSlot, defaultCoreBindings, effectiveSlots, keyboardModernBindings, migrateScheme,
  remapAssignments, removeSlot, setSlotBinding,
} from '@shared/input/scheme';
import { controlSchemeOf } from '@shared/features/hud-style';
import { slotDisplay } from './modern-slots';
import type { ResolvedControl } from '@shared/input/family';
import type { GameSettings } from '@shared/types/settings';
import type {
  CoreBindings, InputBinding, InputProfile, ModernSlot, SlotAssignment, SlotIndex,
} from '@shared/types/controls';

interface UseModernSchemeArgs {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  activeProfile: InputProfile | null;
  updateActiveProfile: (profile: InputProfile) => void;
  controls: ResolvedControl[];
}

/** An assignment on a number the current list does not reach. Kept, never
 *  deleted: a layout may still draw slot 7 for a scheme that has five. */
interface AbsentAssignment {
  index: SlotIndex;
  assignment: SlotAssignment;
}

const useModernScheme = (args: UseModernSchemeArgs) => {
  const { settings, onChange, activeProfile, updateActiveProfile, controls } = args;
  const scheme = controlSchemeOf(settings);
  const isKeyboard = activeProfile?.deviceType === 'keyboard';

  // No stored core yet: the defaults for this device. A gamepad with no
  // control list resolves to an all-unbound core instead of borrowing the
  // keyboard's, because an empty list means "we do not know this pad".
  const coreBindings: CoreBindings = useMemo(() => {
    if (activeProfile?.core) return activeProfile.core;
    if (activeProfile?.modern?.core) return activeProfile.modern.core;
    return isKeyboard ? keyboardModernBindings().core : defaultCoreBindings(controls);
  }, [activeProfile, controls, isKeyboard]);

  // A profile written before §19 still carries `slot:NORTH` ids and an
  // assignment table keyed by them. `migrateScheme` re-keys both together, in
  // the order the slots appear, and throws instead of dropping anything it
  // cannot read. Idempotent, so it costs one pass on an already-numbered list.
  const migrated = useMemo(
    () => migrateScheme(activeProfile?.modern?.slots, settings.modernScheme?.assignments),
    [activeProfile?.modern?.slots, settings.modernScheme],
  );

  // `effectiveSlots` is the SAME function the runtime lens resolves through
  // (lib/input/resolve-bindings.ts), so this screen and the HUD cluster read
  // one list instead of each building their own.
  const modernSlots: ModernSlot[] = useMemo(() => effectiveSlots({
    core: coreBindings,
    controls,
    keyboard: isKeyboard,
    stored: migrated.slots,
  }), [controls, coreBindings, isKeyboard, migrated.slots]);

  const assignments = migrated.assignments;

  const absentAssignments: AbsentAssignment[] = useMemo(() => {
    const present = new Set(modernSlots.map((slot) => slot.index));
    return Object.entries(assignments)
      .map(([key, assignment]) => ({ index: Number(key), assignment }))
      .filter((entry) => !present.has(entry.index) && entry.assignment.kind !== 'none');
  }, [assignments, modernSlots]);

  /** True once there is anything to build a list from at all. */
  const hasSlotSource = controls.length > 0 || isKeyboard || modernSlots.length > 0;


  /**
   * A core rebind writes only the core. Slots no longer move with it: the list
   * is the player's, so binding a gameplay verb onto a control a slot also
   * reads leaves both rows on screen instead of making one vanish. The clash
   * is visible, and removing the slot is one click.
   */
  const applyCoreBinding = useCallback((verb: keyof CoreBindings, binding: InputBinding) => {
    if (!activeProfile) return;
    const nextCore: CoreBindings = { ...coreBindings, [verb]: binding };
    updateActiveProfile({
      ...activeProfile,
      core: nextCore,
      ...(activeProfile.modern ? { modern: { ...activeProfile.modern, core: nextCore } } : {}),
      modifiedAt: Date.now(),
    });
  }, [activeProfile, coreBindings, updateActiveProfile]);

  /** Write the whole list back, and move the assignments with it when the
   *  numbering changed. Both halves in one call, so a removal can never leave
   *  the items one button out of step with the buttons. */
  const writeSlots = useCallback((slots: ModernSlot[], renumber?: ReadonlyMap<SlotIndex, SlotIndex>) => {
    if (!activeProfile) return;
    updateActiveProfile({
      ...activeProfile,
      // The layout this scheme wears is carried through, never rebuilt: a slot
      // edit must not silently move the player's HUD back to the default.
      modern: { ...activeProfile.modern, core: coreBindings, slots },
      modifiedAt: Date.now(),
    });
    if (renumber) onChange({ modernScheme: { assignments: remapAssignments(assignments, renumber) } });
  }, [activeProfile, assignments, coreBindings, onChange, updateActiveProfile]);

  /** A slot rebind keeps the slot's NUMBER and moves only what fires it. That is the
   *  whole point of numbering. Its picture follows the new control. */
  const applySlotBinding = useCallback((slot: ModernSlot, binding: InputBinding) => {
    writeSlots(setSlotBinding(modernSlots, slot.index, binding, slotDisplay(binding, controls)));
  }, [controls, modernSlots, writeSlots]);

  /** Append an empty slot. It has a number and no binding, which is exactly
   *  what "there is a free button here" looks like. */
  const addModernSlot = useCallback(() => {
    writeSlots(addSlot(modernSlots).slots);
  }, [modernSlots, writeSlots]);

  const removeModernSlot = useCallback((index: SlotIndex) => {
    const edit = removeSlot(modernSlots, index);
    writeSlots(edit.slots, edit.renumber);
  }, [modernSlots, writeSlots]);

  return {
    applyCoreBinding,
    applySlotBinding,
    addModernSlot,
    removeModernSlot,
    scheme,
    coreBindings,
    modernSlots,
    assignments,
    absentAssignments,
    hasSlotSource,
  };
};

export { useModernScheme };
export type { AbsentAssignment };

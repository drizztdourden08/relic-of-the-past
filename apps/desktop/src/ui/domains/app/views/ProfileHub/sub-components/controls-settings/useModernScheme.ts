/* @layer renderer-components @kind hook */
import { useCallback, useMemo } from 'react';
import {
  addSlot, defaultCoreBindings, effectiveSlots, keyboardModernBindings, migrateScheme,
  remapAssignments, removeSlot, setSlotBinding,
} from '@shared/input/scheme';
import { controlSchemeOf } from '@shared/features/hud-style';
import { slotDisplay } from './modern-slots';
import type { CoreBindings, InputBinding, ModernSlot, SlotIndex } from '@rotp/game-data';
import type { AbsentAssignment, UseModernSchemeArgs } from './controls-settings.type';

const useModernScheme = (args: UseModernSchemeArgs) => {
  const { settings, onChange, activeProfile, updateActiveProfile, controls } = args;
  const scheme = controlSchemeOf(settings);
  const isKeyboard = activeProfile?.deviceType === 'keyboard';

  const coreBindings: CoreBindings = useMemo(() => {
    if (activeProfile?.core) return activeProfile.core;
    if (activeProfile?.modern?.core) return activeProfile.modern.core;
    return isKeyboard ? keyboardModernBindings().core : defaultCoreBindings(controls);
  }, [activeProfile, controls, isKeyboard]);

  const migrated = useMemo(
    () => migrateScheme(activeProfile?.modern?.slots, settings.modernScheme?.assignments),
    [activeProfile?.modern?.slots, settings.modernScheme],
  );

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

  const hasSlotSource = controls.length > 0 || isKeyboard || modernSlots.length > 0;

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

  const writeSlots = useCallback((slots: ModernSlot[], renumber?: ReadonlyMap<SlotIndex, SlotIndex>) => {
    if (!activeProfile) return;
    updateActiveProfile({
      ...activeProfile,
      modern: { ...activeProfile.modern, core: coreBindings, slots },
      modifiedAt: Date.now(),
    });
    if (renumber) onChange({ modernScheme: { assignments: remapAssignments(assignments, renumber) } });
  }, [activeProfile, assignments, coreBindings, onChange, updateActiveProfile]);

  const applySlotBinding = useCallback((slot: ModernSlot, binding: InputBinding) => {
    writeSlots(setSlotBinding(modernSlots, slot.index, binding, slotDisplay(binding, controls)));
  }, [controls, modernSlots, writeSlots]);

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

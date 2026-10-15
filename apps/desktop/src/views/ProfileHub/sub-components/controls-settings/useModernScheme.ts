/* @layer renderer-components @kind hook */
import { useCallback, useMemo } from 'react';
import { addSlot, effectiveSlots, remapAssignments, removeSlot, setSlotBinding } from '@rotp/input-mapping';
import { controlSchemeOf } from '@rotp/features';
import { findAbsentAssignments } from './find-absent-assignments';
import { slotDisplay } from './modern-slots';
import { profileWithCoreBindings } from './profile-with-core-binding';
import { resolveCoreBindings } from './resolve-core-bindings';
import type { CoreBindings, InputBinding, ModernSlot, SlotIndex } from '@rotp/game-data';
import type { AbsentAssignment, UseModernSchemeArgs } from './controls-settings.type';

const useModernScheme = (args: UseModernSchemeArgs) => {
  const { settings, onChange, activeProfile, updateActiveProfile, controls } = args;
  const scheme = controlSchemeOf(settings);
  const isKeyboard = activeProfile?.deviceType === 'keyboard';

  const coreBindings: CoreBindings = useMemo(
    () => resolveCoreBindings({ activeProfile, controls, isKeyboard }),
    [activeProfile, controls, isKeyboard],
  );

  const storedSlots = activeProfile?.modern?.slots;

  const modernSlots: ModernSlot[] = useMemo(() => effectiveSlots({
    core: coreBindings,
    controls,
    keyboard: isKeyboard,
    stored: storedSlots,
  }), [controls, coreBindings, isKeyboard, storedSlots]);

  const assignments = settings.modernScheme.assignments;

  const absentAssignments: AbsentAssignment[] = useMemo(
    () => findAbsentAssignments(assignments, modernSlots),
    [assignments, modernSlots],
  );

  const hasSlotSource = controls.length > 0 || isKeyboard || modernSlots.length > 0;

  const applyCoreBinding = useCallback((verb: keyof CoreBindings, binding: InputBinding) => {
    if (activeProfile) updateActiveProfile(profileWithCoreBindings(activeProfile, { ...coreBindings, [verb]: binding }));
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

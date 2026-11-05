/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { DEFAULT_LAYOUT } from '@rotp/hud';
import { AbsentAssignments } from './AbsentAssignments';
import type { ControlsProfile } from './controls-profile.type';
import { findAbsentAssignments } from './find-absent-assignments';
import { footerSlots } from './footer-slots';
import { profileLayoutId } from './profile-layout-id';
import { SchemeLayoutRow } from './SchemeLayoutRow';
import type { SlotsFooterProps } from './slots-footer.type';
import { useHudLayouts } from './useHudLayouts';
import './SlotsFooter.css';

const SlotsFooter = ({ context, assignments }: SlotsFooterProps) => {
  const { profile, updateProfile } = context;
  const layouts = useHudLayouts();
  const { verbs, slots, hasSlotSource } = useMemo(() => footerSlots(context), [context]);
  const absent = useMemo(() => findAbsentAssignments(assignments, slots), [assignments, slots]);
  const layoutId = (profile && profileLayoutId(profile)) ?? DEFAULT_LAYOUT.id;

  const handleLayoutChange = useCallback((next: string) => {
    if (!profile) return;
    const updated: ControlsProfile = { ...profile, verbs, layoutId: next, modifiedAt: Date.now() };
    updateProfile(updated);
  }, [profile, verbs, updateProfile]);

  return (
    <>
      <AbsentAssignments entries={absent} />
      <SchemeLayoutRow value={layoutId} layouts={layouts} disabled={!hasSlotSource} onChange={handleLayoutChange} />
    </>
  );
};

export { SlotsFooter };

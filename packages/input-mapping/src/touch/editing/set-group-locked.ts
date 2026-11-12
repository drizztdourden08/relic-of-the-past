/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';

/** Locks or unlocks a button group. */
const setGroupLocked = (layout: OrientationLayout, groupId: string, locked: boolean): OrientationLayout => ({
  ...layout,
  groups: layout.groups.map((group) => (group.id === groupId ? { ...group, locked } : group)),
});

export { setGroupLocked };

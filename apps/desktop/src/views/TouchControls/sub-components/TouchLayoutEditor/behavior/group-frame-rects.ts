/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { basePx, toPx } from '@rotp/input-mapping';
import type { ScreenBox } from '@rotp/input-mapping';
import type { TouchGroupFrameRect } from '@app/compounds/TouchGroupFrame';
import { GROUP_FRAME_PAD_PX } from '../TouchLayoutEditor.constants';

interface GroupFrameEntry {
  id: string;
  locked: boolean;
  rect: TouchGroupFrameRect;
}

/** The bounding rectangle of each group's members, padded. */
const groupFrameRects = (layout: OrientationLayout, box: ScreenBox): GroupFrameEntry[] => {
  const base = basePx(box);
  const entries: GroupFrameEntry[] = [];
  layout.groups.forEach((group) => {
    const members = layout.buttons.filter((button) => button.group === group.id);
    if (members.length === 0) return;
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    members.forEach((button) => {
      const centre = toPx(button.at, box);
      const half = (base * button.scale) / 2;
      left = Math.min(left, centre.x - half);
      top = Math.min(top, centre.y - half);
      right = Math.max(right, centre.x + half);
      bottom = Math.max(bottom, centre.y + half);
    });
    entries.push({
      id: group.id,
      locked: group.locked,
      rect: {
        left: left - GROUP_FRAME_PAD_PX,
        top: top - GROUP_FRAME_PAD_PX,
        width: right - left + GROUP_FRAME_PAD_PX * 2,
        height: bottom - top + GROUP_FRAME_PAD_PX * 2,
      },
    });
  });
  return entries;
};

export { groupFrameRects };
export type { GroupFrameEntry };

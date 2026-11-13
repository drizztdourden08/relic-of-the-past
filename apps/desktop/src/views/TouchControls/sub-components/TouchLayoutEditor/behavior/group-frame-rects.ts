/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { buttonHitBox } from '@rotp/input-mapping';
import type { ScreenBox } from '@rotp/input-mapping';
import { GROUP_FRAME_PAD_PX } from '../TouchLayoutEditor.constants';
import type { GroupFrameEntry } from './group-frame-rects.type';

const groupFrameRects = (layout: OrientationLayout, box: ScreenBox): GroupFrameEntry[] => {
  const entries: GroupFrameEntry[] = [];
  layout.groups.forEach((group) => {
    const members = layout.buttons.filter((button) => button.group === group.id);
    if (members.length === 0) return;
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    members.forEach((button) => {
      const { center, halfW, halfH } = buttonHitBox(button, box);
      left = Math.min(left, center.x - halfW);
      top = Math.min(top, center.y - halfH);
      right = Math.max(right, center.x + halfW);
      bottom = Math.max(bottom, center.y + halfH);
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
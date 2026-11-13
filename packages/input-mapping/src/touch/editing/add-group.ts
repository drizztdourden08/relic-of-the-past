/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchButton, TouchPoint } from '@rotp/features';
import { basePx } from '../geometry/base-px';
import { clampPoint } from '../geometry/clamp-point';
import { toFraction } from '../geometry/to-fraction';
import { toPx } from '../geometry/to-px';
import type { ScreenBox } from '../touch-logic.type';
import { emitLabel } from './emit-label';
import type { GroupPresetId } from './group-preset.type';
import { GROUP_PRESETS } from './group-presets.constants';
import { uniqueButtonId } from './unique-button-id';

const addGroup = (layout: OrientationLayout, presetId: GroupPresetId, at: TouchPoint, box: ScreenBox): OrientationLayout => {
  const preset = GROUP_PRESETS[presetId];
  const groupId = uniqueButtonId(new Set(layout.groups.map((g) => g.id)), presetId);
  const used = new Set(layout.buttons.map((b) => b.id));
  const centre = toPx(at, box);
  const step = basePx(box) * preset.spacing;
  const buttons = preset.members.map(({ emit, dx, dy }): TouchButton => {
    const id = uniqueButtonId(used, emit);
    used.add(id);
    const point = toFraction({ x: centre.x + dx * step, y: centre.y + dy * step }, box);
    return { id, emit, label: emitLabel(emit), at: clampPoint(point), scale: preset.scale, ...preset.form, group: groupId };
  });
  const group = { id: groupId, label: preset.label, locked: true };
  return { ...layout, groups: [...layout.groups, group], buttons: [...layout.buttons, ...buttons] };
};

export { addGroup };

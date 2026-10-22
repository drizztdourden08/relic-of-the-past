/* @layer renderer-lib @kind logic */
import type { ResolvedControl } from '@rotp/input-mapping';
import type { GroupedAxisControls, StickPairGroup } from './resolved-axis-groups.type';

const stickPairFor = (control: ResolvedControl, axes: readonly ResolvedControl[]): StickPairGroup | null => {
  if (!control.position.endsWith('_X')) return null;
  const yPosition = control.position.replace(/_X$/, '_Y');
  const yControl = axes.find((c) => c.position === yPosition);
  if (!yControl) return null;
  return { label: control.label.replace(/ X$/, ''), basePrefix: control.icon, xControl: control, yControl };
};

const groupAxisControls = (controls: readonly ResolvedControl[]): GroupedAxisControls => {
  const axes = controls.filter((c) => c.kind === 'axis');
  const stickPairs: StickPairGroup[] = [];
  const triggers: ResolvedControl[] = [];
  const consumed = new Set<string>();

  for (const control of axes) {
    if (consumed.has(control.position)) continue;
    if (control.category === 'trigger') {
      triggers.push(control);
      consumed.add(control.position);
      continue;
    }
    const pair = stickPairFor(control, axes);
    if (!pair) continue;
    stickPairs.push(pair);
    consumed.add(pair.xControl.position);
    consumed.add(pair.yControl.position);
  }

  return { stickPairs, triggers };
};

export { groupAxisControls };

/* @layer renderer-lib @kind logic */
import type { ResolvedControl } from '@shared/input/family';
import type { GroupedAxisControls, StickPairGroup } from './resolved-axis-groups.type';

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
    if (!control.position.endsWith('_X')) continue;
    const yPosition = control.position.replace(/_X$/, '_Y');
    const yControl = axes.find((c) => c.position === yPosition);
    if (!yControl) continue;
    stickPairs.push({
      label: control.label.replace(/ X$/, ''),
      basePrefix: control.icon,
      xControl: control,
      yControl,
    });
    consumed.add(control.position);
    consumed.add(yPosition);
  }

  return { stickPairs, triggers };
};

export { groupAxisControls };
export type { GroupedAxisControls, StickPairGroup };

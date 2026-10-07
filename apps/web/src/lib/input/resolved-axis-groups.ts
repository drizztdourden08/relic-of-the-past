/* @layer renderer-lib @kind logic */
/**
 * Groups a ResolvedDevice's axis controls into stick pairs (X plus Y) and
 * lone trigger axes, the shape the sticks/triggers panel actually renders.
 * Pairing is by position name (LEFT_X pairs with LEFT_Y, RIGHT_X with
 * RIGHT_Y), not array order, so a device reporting only one axis of
 * a pair still resolves the rest correctly instead of misaligning.
 */
import type { ResolvedControl } from '@shared/input/family';

interface StickPairGroup {
  readonly label: string;
  /** The base icon key both axes share (see nintendo.family.ts); feed this
   *  and the live x/y into resolveStickDirectionIcon for the glyph to show. */
  readonly basePrefix: string;
  readonly xControl: ResolvedControl;
  readonly yControl: ResolvedControl;
}

interface GroupedAxisControls {
  readonly stickPairs: readonly StickPairGroup[];
  readonly triggers: readonly ResolvedControl[];
}

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

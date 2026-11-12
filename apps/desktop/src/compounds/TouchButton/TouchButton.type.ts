/* @layer renderer-app @kind types */
import type { TouchButtonShape } from '@rotp/features';
import type { PxPoint } from '@rotp/input-mapping';

interface TouchButtonProps {
  label: string;
  shape: TouchButtonShape;
  /** Diameter of a round button; a pill is wider than it is tall from the same number. */
  sizePx: number;
  center: PxPoint;
  pressed: boolean;
  /** Opacity of the border and label, 0.1..1. */
  strength: number;
  selected?: boolean;
}

export type { TouchButtonProps };

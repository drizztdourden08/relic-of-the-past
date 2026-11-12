/* @layer renderer-app @kind types */
import type { TouchButtonShape } from '@rotp/features';
import type { PxPoint } from '@rotp/input-mapping';

interface TouchButtonProps {
  label: string;
  shape: TouchButtonShape;
  sizePx: number;
  center: PxPoint;
  pressed: boolean;
  strength: number;
  selected?: boolean;
}

export type { TouchButtonProps };

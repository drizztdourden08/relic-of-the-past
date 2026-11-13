/* @layer renderer-app @kind types */
import type { TouchButtonForm } from '@rotp/features';
import type { PxPoint } from '@rotp/input-mapping';

interface TouchButtonProps {
  label: string;
  form: TouchButtonForm;
  sizePx: number;
  center: PxPoint;
  pressed: boolean;
  strength: number;
  selected?: boolean;
}

export type { TouchButtonProps };

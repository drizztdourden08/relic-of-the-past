/* @layer renderer-app @kind types */
import type { TouchOrientation } from '@rotp/features';

interface TouchEditBarProps {
  orientation: TouchOrientation;
  onAdd: () => void;
  onLayer: () => void;
  onCancel: () => void;
  onDone: () => void;
}

export type { TouchEditBarProps };

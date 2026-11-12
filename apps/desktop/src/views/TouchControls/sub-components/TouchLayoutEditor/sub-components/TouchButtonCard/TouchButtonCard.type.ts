/* @layer renderer-app @kind types */
import type { TouchButton, TouchButtonShape, TouchEmit, TouchGroup } from '@rotp/features';

interface TouchButtonCardProps {
  button: TouchButton;
  /** The button's group, or undefined for a free button. */
  group: TouchGroup | undefined;
  onEmit: (emit: TouchEmit) => void;
  onScale: (scale: number) => void;
  onShape: (shape: TouchButtonShape) => void;
  onRemove: () => void;
  onLock: (locked: boolean) => void;
}

export type { TouchButtonCardProps };

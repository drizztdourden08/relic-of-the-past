/* @layer renderer-app @kind types */
import type { TouchButton, TouchButtonForm, TouchEmit, TouchGroup } from '@rotp/features';

interface TouchButtonCardProps {
  button: TouchButton;
  group: TouchGroup | undefined;
  onEmit: (emit: TouchEmit) => void;
  onScale: (scale: number) => void;
  onForm: (form: Partial<TouchButtonForm>) => void;
  onRemove: () => void;
  onLock: (locked: boolean) => void;
}

export type { TouchButtonCardProps };

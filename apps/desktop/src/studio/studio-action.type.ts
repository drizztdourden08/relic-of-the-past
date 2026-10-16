/* @layer renderer-components @kind types */
import type { ButtonVariant } from '@drizztdourden08/tessera/primitives';

interface StudioAction {
  id: string;
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  onSelect: () => void | Promise<void>;
}

interface StudioActionGroup {
  id: string;
  label: string;
  actions: readonly StudioAction[];
}

export type { StudioAction, StudioActionGroup };

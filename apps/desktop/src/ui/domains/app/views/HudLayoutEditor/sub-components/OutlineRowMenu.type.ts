/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { StepDirection } from '../behavior/step-intent';
import type { HudLayout } from '@shared/types/hud';

interface OutlineRowMenuProps {
  doc: HudLayout;
  id: string;
  anchorRef: RefObject<HTMLElement | null>;
  removable: boolean;
  onStep: (direction: StepDirection) => void;
  onRemove: () => void;
  onClose: () => void;
}

export type { OutlineRowMenuProps };

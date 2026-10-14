/* @layer renderer-components @kind types */
import type { StepDirection } from '@app/hud-layout-editing/step-intent';
import type { HudLayout } from '@rotp/hud';

interface OutlineMenuHostProps {
  doc: HudLayout;
  menuId: string | null;
  anchor: HTMLElement | null;
  onStep: (id: string, direction: StepDirection) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export type { OutlineMenuHostProps };

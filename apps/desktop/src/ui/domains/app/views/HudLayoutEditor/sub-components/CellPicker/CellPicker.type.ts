/* @layer renderer-components @kind types */
import type { HudGridContainer, HudPlace } from '@rotp/hud';

interface CellPickerProps {
  container: HudGridContainer;
  childId: string;
  place: HudPlace | undefined;
  onChange: (next: HudPlace) => void;
}

export type { CellPickerProps };

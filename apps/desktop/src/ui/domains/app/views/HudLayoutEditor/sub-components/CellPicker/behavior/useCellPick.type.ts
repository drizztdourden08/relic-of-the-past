/* @layer renderer-components @kind types */
import type { HudPlace } from '@shared/types/hud';

interface UseCellPickParams {
  place: HudPlace | undefined;
  onChange: (next: HudPlace) => void;
}

export type { UseCellPickParams };

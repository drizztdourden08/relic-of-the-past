/* @layer renderer-components @kind types */
import type { HudCountdownSpec } from '@shared/types/hud';

interface CountdownContentProps {
  spec: HudCountdownSpec;
  onChange: (patch: Partial<HudCountdownSpec>) => void;
}

export type { CountdownContentProps };

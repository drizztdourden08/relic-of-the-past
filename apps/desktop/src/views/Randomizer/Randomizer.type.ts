/* @layer renderer-components @kind types */
import type { GridSpan } from '@drizztdourden08/tessera/primitives';

type RandomizerTab = 'run' | 'options' | 'network' | 'online' | 'logs' | 'spoiler';

interface PanelPlacement {
  section: string;
  span: GridSpan;
}

interface RandomizerProps {
  tab: RandomizerTab;
  open: (target: string) => void;
}

export type { PanelPlacement, RandomizerProps, RandomizerTab };

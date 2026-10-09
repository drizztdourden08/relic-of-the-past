/* @layer renderer-components @kind types */
import type { IconifyIcon } from '@iconify/react/offline';
import type { GridSpan } from '@drizztdourden08/tessera/primitives';

type RandomizerTab = 'run' | 'options' | 'network' | 'online' | 'logs' | 'spoiler';

interface PanelPlacement {
  section: string;
  span: GridSpan;
}

interface RandomizerTabSpec {
  label: string;
  navIcon: IconifyIcon;
  archipelagoOnly?: boolean;
  scroll?: boolean;
}

interface RandomizerNavGroup {
  id: string;
  label: string;
  tabs: RandomizerTab[];
}

interface RandomizerProps {
  activeProfile: Profile | null;
}

export type { PanelPlacement, RandomizerNavGroup, RandomizerProps, RandomizerTab, RandomizerTabSpec };

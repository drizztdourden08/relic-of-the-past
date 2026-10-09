/* @layer renderer-components @kind types */
import type { IconifyIcon } from '@iconify/react/offline';
import type { DashboardPanelProps } from '@drizztdourden08/tessera/composites';

type RandomizerTab = 'run' | 'options' | 'network' | 'online' | 'logs' | 'spoiler';

type PanelPlacement = Required<Pick<DashboardPanelProps, 'section' | 'span'>>;

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

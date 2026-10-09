/* @layer renderer-components @kind types */
import type { NetworkView } from '../behavior/network-view.type';
import type { PanelPlacement } from '../../../Randomizer.type';

interface HealthSectionProps {
  placement: PanelPlacement;
  view: NetworkView;
  now: number;
}

export type { HealthSectionProps };

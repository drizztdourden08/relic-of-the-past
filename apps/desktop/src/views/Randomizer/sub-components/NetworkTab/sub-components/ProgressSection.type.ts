/* @layer renderer-components @kind types */
import type { NetworkView } from '../behavior/network-view.type';
import type { PanelPlacement } from '../../../Randomizer.type';

interface ProgressSectionProps {
  placement: PanelPlacement;
  view: NetworkView;
}

export type { ProgressSectionProps };

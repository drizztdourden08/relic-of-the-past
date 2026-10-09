/* @layer renderer-components @kind types */
import type { NetworkView } from '../behavior/network-view.type';
import type { PanelPlacement } from '../../../Randomizer.type';

interface ServerSectionProps {
  placement: PanelPlacement;
  view: NetworkView;
}

export type { ServerSectionProps };

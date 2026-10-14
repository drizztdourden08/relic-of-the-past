/* @layer renderer-components @kind types */
import type { SoundPanelController } from './msu.type';

type SoundPanelControlsProps = {
  sound: SoundPanelController;
  filter: string;
  showUnreachable: boolean;
  onFilterChange: (filter: string) => void;
  onShowUnreachableChange: (show: boolean) => void;
};

export type { SoundPanelControlsProps };

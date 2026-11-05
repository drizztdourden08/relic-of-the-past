/* @layer renderer-components @kind types */
import type { PanelTab } from '@app/views/DataManager/sub-components/profile-manager/RandomizerOptionsPanel.type';

interface OptionTabControl {
  tab: PanelTab;
  setTab: (tab: PanelTab) => void;
}

export type { OptionTabControl };

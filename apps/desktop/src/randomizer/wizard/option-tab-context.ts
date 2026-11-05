/* @layer renderer-components @kind context */
import { createContext } from 'react';
import type { PanelTab } from '@app/views/DataManager/sub-components/profile-manager/RandomizerOptionsPanel.type';

interface OptionTabControl {
  tab: PanelTab;
  setTab: (tab: PanelTab) => void;
}

const OptionTabContext = createContext<OptionTabControl | null>(null);

export { OptionTabContext };
export type { OptionTabControl };

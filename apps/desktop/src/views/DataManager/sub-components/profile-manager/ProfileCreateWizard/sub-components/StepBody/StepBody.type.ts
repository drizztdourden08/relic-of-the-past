/* @layer renderer-components @kind types */
import type { PanelTab } from '../../../RandomizerOptionsPanel.type';
import type { ProfileCreateWizardProps, ProfileWizardApi } from '../../ProfileCreateWizard.type';

interface StepBodyProps extends Pick<ProfileCreateWizardProps, 'readyRoms' | 'languages' | 'msuPacks'> {
  wizard: ProfileWizardApi;
  experimental: boolean;
  optionTab: PanelTab;
  onOptionTab: (tab: PanelTab) => void;
}

export type { StepBodyProps };

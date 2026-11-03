/* @layer renderer-components @kind types */
import type { PanelTab } from '../../../RandomizerOptionsPanel.type';
import type { ProfileWizardValues, UpdateValues } from '../../ProfileCreateWizard.type';

interface OptionsStepProps {
  values: ProfileWizardValues;
  update: UpdateValues;
  tab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
}

export type { OptionsStepProps };

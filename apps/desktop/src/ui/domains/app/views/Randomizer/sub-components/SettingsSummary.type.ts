/* @layer renderer-components @kind types */
import type { OptionsSummary } from '../behavior/options-summary.type';
import type { PanelPlacement } from '../Randomizer.type';

interface SettingsSummaryProps {
  placement: PanelPlacement;
  summary: OptionsSummary;
  onOpenOptions: () => void;
}

export type { SettingsSummaryProps };

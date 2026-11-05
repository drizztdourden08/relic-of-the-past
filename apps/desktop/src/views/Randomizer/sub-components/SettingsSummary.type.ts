/* @layer renderer-components @kind types */
import type { OptionsSummary } from '../behavior/options-summary.type';

interface SettingsSummaryProps {
  summary: OptionsSummary;
  onOpenOptions: () => void;
}

export type { SettingsSummaryProps };

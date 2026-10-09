/* @layer renderer-components @kind types */
import type { PanelPlacement } from '../Randomizer.type';

interface OptionsSummaryProps {
  pool: PanelPlacement;
  settings: PanelPlacement;
  options: unknown;
  seed: string;
  onOpenOptions: () => void;
}

export type { OptionsSummaryProps };

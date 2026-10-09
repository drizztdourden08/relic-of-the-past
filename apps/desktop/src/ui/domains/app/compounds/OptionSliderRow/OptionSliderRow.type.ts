/* @layer renderer-components @kind types */
import type { OptionDescription as OptionDescriptionText } from '@rotp/randomizer';

interface OptionSliderRowProps {
  label: string;
  description?: OptionDescriptionText;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  formatValue: (value: number) => string;
  onChange?: (value: number) => void;
  readout?: boolean;
}

export type { OptionSliderRowProps };

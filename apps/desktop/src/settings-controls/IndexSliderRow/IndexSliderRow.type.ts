/* @layer renderer-app @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';

interface IndexSliderRowProps {
  settingKey: string;
  index: number;
  count: number;
  formatIndex: (index: number) => Text;
  onIndex: (index: number) => void;
  disabled: boolean;
}

interface StopSliderInput {
  settingKey: string;
  stops: readonly number[];
  value: number;
  format: (stop: number) => Text;
  onStop: (stop: number) => void;
  disabled: boolean;
}

export type { IndexSliderRowProps, StopSliderInput };

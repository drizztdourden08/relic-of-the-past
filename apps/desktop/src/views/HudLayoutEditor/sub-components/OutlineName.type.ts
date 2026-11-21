/* @layer renderer-components @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
interface OutlineNameProps {
  kind: 'container' | 'element';
  label: string;
  cell?: string;
  locked?: Text;
  missingSlots: readonly number[];
  selected: boolean;
  onSelect: () => void;
}

export type { OutlineNameProps };

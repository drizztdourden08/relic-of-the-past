/* @layer renderer-components @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
interface OutlineRowClassInput {
  selected: boolean;
  dragging: boolean;
  dropClass: string;
  locked: Text | undefined;
  isScreen: boolean | undefined;
  shaking: boolean | undefined;
}

export type { OutlineRowClassInput };

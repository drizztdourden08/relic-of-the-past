/* @layer renderer-components @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { MODE_OPTIONS } from '../ShopSlotsBlock.constants';

const modeOptionsOf = (text: (value: Text) => string): { value: string; label: string }[] =>
  MODE_OPTIONS.map(({ value, label }) => ({ value, label: text(label) }));

export { modeOptionsOf };

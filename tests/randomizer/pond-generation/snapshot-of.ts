/* @layer tests @kind helper */
import { baselineValues } from '@shared/randomizer/world/options.data';
import type { OptionValue, RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';

const snapshotOf = (over: Record<string, OptionValue>): RandomizerOptionsSnapshot =>
  ({ schema: 'ap-options-v2', values: { ...baselineValues, ...over } });

export { snapshotOf };

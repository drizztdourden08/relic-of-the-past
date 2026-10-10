/* @layer tests @kind helper */
import { baselineValues } from '@rotp/randomizer';
import type { OptionValue, RandomizerOptionsSnapshot } from '@rotp/randomizer';

const snapshotOf = (over: Record<string, OptionValue>): RandomizerOptionsSnapshot =>
  ({ schema: 'ap-options-v2', values: { ...baselineValues, ...over } });

export { snapshotOf };

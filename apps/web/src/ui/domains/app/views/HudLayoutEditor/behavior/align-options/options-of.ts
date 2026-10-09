/* @layer renderer-components @kind logic */
import { OPTION } from './align-options.constants';
import type { AlignOption, AlignValue } from './align-options.type';

const optionsOf = (values: readonly AlignValue[]): readonly AlignOption[] =>
  values.map((value) => ({ value, label: OPTION[value] }));

export { optionsOf };

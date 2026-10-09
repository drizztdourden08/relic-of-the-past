/* @layer shared-game @kind logic */
import { choicesOf } from './choices-of';
import type { OptionDef } from '../../world/options.type';

const choiceIdOf = (option: OptionDef, value: string): number | undefined =>
  choicesOf(option)?.find((choice) => choice.value === value)?.id;

export { choiceIdOf };

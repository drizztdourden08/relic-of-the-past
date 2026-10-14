/* @layer renderer-components @kind logic */
import type { OptionDef, OptionValue } from '@rotp/randomizer';
import { choiceLabelOf } from '../../OptionValueTag';
import { EMPTY_CHOICES } from '../RandomizerOptionRow.constants';

const readoutOf = (option: OptionDef, value: OptionValue): boolean | string => {
  if (option.kind === 'toggle') return Boolean(value);
  if (option.kind === 'choice') return choiceLabelOf(option.choices ?? EMPTY_CHOICES, String(value));
  return String(value);
};

export { readoutOf };

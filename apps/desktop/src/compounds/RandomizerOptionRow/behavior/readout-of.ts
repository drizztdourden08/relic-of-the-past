/* @layer renderer-components @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { OptionDef, OptionValue } from '@rotp/randomizer';
import { choiceLabelOf } from '@app/hooks/randomizer/option-labels';
import { EMPTY_CHOICES } from '../RandomizerOptionRow.constants';

const readoutOf = (option: OptionDef, value: OptionValue, text: (text: Text) => string): boolean | string => {
  if (option.kind === 'toggle') return Boolean(value);
  if (option.kind === 'choice') return choiceLabelOf((option.choices ?? EMPTY_CHOICES).map((choice) => ({ value: choice.value, label: text(choice.label) })), String(value));
  return String(value);
};

export { readoutOf };

/* @layer shared-game @kind logic */
import { optionByKey } from '../world/options';
import { choiceIdOf } from './export/choice-id-of';
import { ARCHIPELAGO_ROLL_WORD } from './archipelago.constants';

const concreteOptionValue = (key: string, value: unknown): unknown => {
  if (typeof value !== 'string' || !ARCHIPELAGO_ROLL_WORD.test(value)) return value;
  const option = optionByKey.get(key);
  if (option?.kind !== 'choice') return value;
  const id = choiceIdOf(option, value);
  if (id === undefined) throw new Error(`${key}: ${value} is not a choice of this option`);
  return id;
};

export { concreteOptionValue };

/* @layer shared-game @kind logic */
/**
 * Archipelago reads the word `random` as an option value in a player file as its own keyword:
 * roll any value of the option. In this app `random` is a real choice of some rows (a
 * progressive family's any-order mode, the shop shuffle's random mode), the value the pre-roll
 * was built for. Written as the word, the generator would roll a different one and the package
 * would refuse the file for disagreeing with its pre-roll.
 *
 * So such a choice is written as its numeric id, which Archipelago stores as is and the package
 * reads back as the same app value (options.py app_value_of): the file, the pre-roll and the
 * slot data's options all say `random`, and nothing is rolled. Every other value passes through.
 */
import { optionByKey } from '../world/options.data';
import { choiceIdOf } from './export/export-options';

const ROLL_WORD = /^random$/i;

const concreteOptionValue = (key: string, value: unknown): unknown => {
  if (typeof value !== 'string' || !ROLL_WORD.test(value)) return value;
  const option = optionByKey.get(key);
  if (option?.kind !== 'choice') return value;
  const id = choiceIdOf(option, value);
  if (id === undefined) throw new Error(`${key}: ${value} is not a choice of this option`);
  return id;
};

/** Every value of an options block, with each chosen `random` written as its id. */
const concreteOptionValues = (values: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [key, concreteOptionValue(key, value)]));

export { concreteOptionValue, concreteOptionValues };

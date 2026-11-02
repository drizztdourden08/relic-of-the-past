/* @layer shared-game @kind logic */
import type { OptionDef, OptionValue } from '../../world/options.type';
import { FALSE_WORDS, TRUE_WORDS } from './plain-option-value.constants';

const toggleOf = (option: OptionDef, raw: unknown): boolean => {
  if (typeof raw === 'boolean') return raw;
  const word = String(raw).trim().toLowerCase();
  if (TRUE_WORDS.has(word)) return true;
  if (FALSE_WORDS.has(word)) return false;
  throw new Error(`${option.key} is a toggle: use true or false, not ${JSON.stringify(raw)}.`);
};

const rangeOf = (option: OptionDef, raw: unknown): number => {
  const value = typeof raw === 'number' ? raw : Number(String(raw).trim());
  const { min, max } = option.range ?? { min: -Infinity, max: Infinity };
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${option.key} is a range from ${min} to ${max}, not ${JSON.stringify(raw)}.`);
  }
  return value;
};

const choiceOf = (option: OptionDef, raw: unknown): string => {
  const choices = option.choices ?? [];
  const found = choices.find((choice) => choice.value === String(raw));
  if (found === undefined) {
    throw new Error(`${option.key} is one of ${choices.map((choice) => choice.value).join(', ')}, not ${JSON.stringify(raw)}.`);
  }
  return found.value;
};

const plainOptionValue = (option: OptionDef, raw: unknown): OptionValue => {
  if (option.kind === 'toggle') return toggleOf(option, raw);
  if (option.kind === 'range') return rangeOf(option, raw);
  if (option.kind === 'choice') return choiceOf(option, raw);
  return String(raw);
};

export { plainOptionValue };

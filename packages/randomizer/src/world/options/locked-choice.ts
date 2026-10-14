/* @layer shared-game @kind logic */
import type { OptionChoice, OptionHead, OptionSeed } from '../options.type';

const lockedChoice = (
  head: OptionHead, options: readonly OptionChoice[], sourceDefault: string, baseline: string = sourceDefault,
): OptionSeed => {
  const { key, displayName, group, implementation } = head;
  return { key, displayName, group, kind: 'choice', implementation, choices: options, sourceDefault, baseline, locked: true };
};

export { lockedChoice };

/* @layer shared-game @kind logic */
import type { OptionChoice, OptionGroupId, OptionImplementation, OptionSeed } from '../options.type';

const lockedChoice = (
  key: string, displayName: string, group: OptionGroupId, implementation: OptionImplementation,
  options: readonly OptionChoice[], sourceDefault: string, baseline: string = sourceDefault,
): OptionSeed =>
  ({ key, displayName, group, kind: 'choice', implementation, choices: options, sourceDefault, baseline, locked: true });

export { lockedChoice };

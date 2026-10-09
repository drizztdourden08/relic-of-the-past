/* @layer shared-game @kind logic */
import type { OptionGroupId, OptionImplementation, OptionSeed } from '../options.type';

const lockedToggle = (
  key: string, displayName: string, group: OptionGroupId, implementation: OptionImplementation,
  sourceDefault = false, baseline = sourceDefault,
): OptionSeed =>
  ({ key, displayName, group, kind: 'toggle', implementation, sourceDefault, baseline, locked: true });

export { lockedToggle };

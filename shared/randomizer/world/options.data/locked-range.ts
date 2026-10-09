/* @layer shared-game @kind logic */
import type { OptionGroupId, OptionImplementation, OptionSeed } from '../options.type';

const lockedRange = (
  key: string, displayName: string, group: OptionGroupId, implementation: OptionImplementation,
  min: number, max: number, sourceDefault: number, baseline: number = sourceDefault,
): OptionSeed =>
  ({ key, displayName, group, kind: 'range', implementation, range: { min, max }, sourceDefault, baseline, locked: true });

export { lockedRange };

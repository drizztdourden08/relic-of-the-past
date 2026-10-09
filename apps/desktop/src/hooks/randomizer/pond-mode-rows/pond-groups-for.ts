/* @layer renderer-hooks @kind logic */
import { POND_MODE_KEYS } from '@rotp/randomizer';
import type { LockedOptionGroup } from '@app/compounds/RandomizerOptionRow';
import type { OptionDef, PondMode } from '@rotp/randomizer';

const narrowed = (option: OptionDef, modes: readonly PondMode[]): OptionDef =>
  (option.key === POND_MODE_KEYS.capacity
    ? { ...option, choices: option.choices?.filter((choice) => modes.includes(choice.value as PondMode)) }
    : option);

const pondGroupsFor = (
  groups: readonly LockedOptionGroup[], modes: readonly PondMode[],
): LockedOptionGroup[] =>
  groups.map(({ group, options }) => ({ group, options: options.map((option) => narrowed(option, modes)) }));

export { pondGroupsFor };

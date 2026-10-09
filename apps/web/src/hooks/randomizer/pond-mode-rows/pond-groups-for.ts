/* @layer renderer-hooks @kind logic */
import { POND_MODE_KEYS } from '@shared/randomizer/world/pond/pond-option-keys';
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { OptionDef } from '@shared/randomizer/world/options.type';
import type { PondMode } from '@shared/randomizer/world/pond/pond-profile.type';

const narrowed = (option: OptionDef, modes: readonly PondMode[]): OptionDef =>
  (option.key === POND_MODE_KEYS.capacity
    ? { ...option, choices: option.choices?.filter((choice) => modes.includes(choice.value as PondMode)) }
    : option);

const pondGroupsFor = (
  groups: readonly LockedOptionGroup[], modes: readonly PondMode[],
): LockedOptionGroup[] =>
  groups.map(({ group, options }) => ({ group, options: options.map((option) => narrowed(option, modes)) }));

export { pondGroupsFor };

/* @layer renderer-hooks @kind logic */
/**
 * The pond tab's own reading of the catalog's capacity-pond mode row: the same
 * entry with its choice list narrowed to the modes the capacity/pond rule
 * still allows. Narrowing the DROPDOWN instead of refusing the pick afterwards
 * is the point: a mode that cannot be honoured is never offered, and the note
 * beside the row says why it is missing.
 *
 * Only that one pond is bound by the rule: it is the game's only source of the
 * two families the rule protects, so the other two ponds keep every mode.
 */
import { POND_MODE_KEYS } from '@shared/randomizer/ap-world/pond/pond-option-keys';
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { ApOptionDef } from '@shared/randomizer/ap-world/options.type';
import type { PondMode } from '@shared/randomizer/ap-world/pond/pond-profile.type';

/** The capacity pond's mode row, frozen: the master switch is off, so it is not the player's to set. */
const FROZEN_POND_KEYS: ReadonlySet<string> = new Set([POND_MODE_KEYS.capacity]);

const NO_FROZEN_KEYS: ReadonlySet<string> = new Set();

const narrowed = (option: ApOptionDef, modes: readonly PondMode[]): ApOptionDef =>
  (option.key === POND_MODE_KEYS.capacity
    ? { ...option, choices: option.choices?.filter((choice) => modes.includes(choice.value as PondMode)) }
    : option);

/** The tab's groups with the mode row's choices cut down to `modes`. */
const pondGroupsFor = (
  groups: readonly LockedOptionGroup[], modes: readonly PondMode[],
): LockedOptionGroup[] =>
  groups.map(({ group, options }) => ({ group, options: options.map((option) => narrowed(option, modes)) }));

export { FROZEN_POND_KEYS, NO_FROZEN_KEYS, pondGroupsFor };

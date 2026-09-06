/* @layer renderer-hooks @kind logic */
/**
 * The pond tab's own reading of the catalog's `pond_mode` row: the same entry
 * with its choice list narrowed to the modes the capacity/pond rule still
 * allows. Narrowing the DROPDOWN rather than refusing the pick afterwards is
 * the point — a mode that cannot be honoured is never offered, and the note
 * beside the row says why it is missing.
 */
import { POND_MODE_KEY } from '@shared/randomizer/ap-world/pond/pond-option-keys';
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { ApOptionDef } from '@shared/randomizer/ap-world/options.type';
import type { PondMode } from '@shared/randomizer/ap-world/pond/pond-profile.type';

/** The mode row, frozen: the master switch is off, so the pond is not the player's to set. */
const FROZEN_POND_KEYS: ReadonlySet<string> = new Set([POND_MODE_KEY]);

const NO_FROZEN_KEYS: ReadonlySet<string> = new Set();

const narrowed = (option: ApOptionDef, modes: readonly PondMode[]): ApOptionDef =>
  (option.key === POND_MODE_KEY
    ? { ...option, choices: option.choices?.filter((choice) => modes.includes(choice.value as PondMode)) }
    : option);

/** The tab's groups with the mode row's choices cut down to `modes`. */
const pondGroupsFor = (
  groups: readonly LockedOptionGroup[], modes: readonly PondMode[],
): LockedOptionGroup[] =>
  groups.map(({ group, options }) => ({ group, options: options.map((option) => narrowed(option, modes)) }));

export { FROZEN_POND_KEYS, NO_FROZEN_KEYS, pondGroupsFor };

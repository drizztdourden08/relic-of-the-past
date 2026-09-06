/* @layer shared-game @kind logic */
/**
 * The settings screens' own name lookup: an internal identity in, the name the
 * player knows out.
 *
 * The randomizer options were written with neutral wording ("Lift", "Red
 * cane", "Plain") because the code they live in may not spell the game's own
 * terms. The terms themselves are legitimate DATA, and this project already
 * transcribes them once, per item, in the record set the private companion
 * repo ships (`shared/game/data/records/items/**`, field `randomizerName`).
 * So there is no second dictionary here: this module indexes THAT one and
 * answers from it.
 *
 * A checkout without the records is the reason for the fallback instead of a
 * throw. `shared/game/data/items` globs its record modules, which resolves to
 * an empty registry when the folder is absent, so `known` is empty and every
 * caller keeps the neutral wording it passed in. The screens stay readable and
 * nothing fails, the same contract every other reader of that registry keeps.
 *
 * The lookup is by IDENTITY, not by translation table: the identities the
 * generator uses are the reference project's own item names, which is exactly
 * what `randomizerName` holds. Asking the registry therefore answers one
 * question (is this a name the dataset sanctions?) and returns it when it is.
 */
import { ALL_ITEMS } from '@shared/game/data/items';

/** Every name the record set sanctions; empty in a checkout without the dataset. */
const SANCTIONED_ITEM_NAMES: ReadonlySet<string> = new Set(
  ALL_ITEMS.map((item) => item.randomizerName).filter((name) => typeof name === 'string' && name.length > 0),
);

/** Whether the dictionary is on disk at all: false in a checkout without the dataset. */
const hasItemDictionary = (): boolean => SANCTIONED_ITEM_NAMES.size > 0;

/**
 * The name to show for one item identity. |neutral| is the wording the screen
 * used before the dictionary existed and is what it keeps when the dataset is
 * absent or does not carry this identity.
 */
const itemDisplayName = (identity: string, neutral: string): string =>
  (SANCTIONED_ITEM_NAMES.has(identity) ? identity : neutral);

/**
 * The same lookup for a phrase built around a name: the neutral phrase is used
 * whole when the identity is unknown, so a caller never has to compose one
 * sentence twice.
 */
const itemPhrase = (identity: string, neutral: string, phrase: (name: string) => string): string =>
  (SANCTIONED_ITEM_NAMES.has(identity) ? phrase(identity) : neutral);

export { SANCTIONED_ITEM_NAMES, hasItemDictionary, itemDisplayName, itemPhrase };

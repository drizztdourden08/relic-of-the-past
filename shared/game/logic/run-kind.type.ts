/* @layer shared-game @kind types */
/**
 * Which run the app is answering for. Three, not two, and that is the whole point of the
 * type: a seed loaded from disk and an online multiworld are both randomized, but only the
 * first one can say what any location holds. Asking "is there a placement" answers the
 * first question and gets the second one wrong, which is how an online session came to be
 * read as plain play.
 *
 *  - normal: the unrandomized game with everything on. Every location holds what it always did.
 *  - seed:   a placement generated here, so every location's item is known up front.
 *  - online: a multiworld session. The server hands locations over one at a time, so nothing
 *            here knows what a location holds until it is collected.
 */
type RunKind = 'normal' | 'seed' | 'online';

export type { RunKind };

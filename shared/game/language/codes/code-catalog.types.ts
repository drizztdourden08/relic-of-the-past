/* @layer shared-game @kind types */
/**
 * Types for the plain-language control-code catalog: the presentation layer
 * that turns a bracketed engine code (`[Speed 04]`, `[Waitkey]`, ...) into
 * something a translator can read and pick from a menu.
 */

/**
 * How risky it is to let a translator insert this code.
 * - `safe` — an ordinary formatting/timing code.
 * - `structural` — builds part of a fixed UI shape (a choice cursor, an item
 *   picker); legitimate to place, but the surrounding lines matter.
 * - `dangerous` — has no working handler; inserting it breaks or hangs the
 *   game. Never offered in a menu.
 */
type CodeRisk = 'safe' | 'structural' | 'dangerous';

/**
 * Where a code's effect applies. `positional` codes act at the point they
 * appear in the token stream. `message` codes are consumed in a pre-pass
 * before the message is shown and apply to the whole message — when more
 * than one appears, the LAST one in the string wins.
 */
type CodeScope = 'positional' | 'message';

/** Display-only hint for a code's parameter, independent of what any one language can actually encode. */
type CodeParamRange = { min: number; max: number };

/** One catalog entry: a human-facing description of a bracketed control code. */
type CodeInfo = {
  name: string;
  label: string;
  description: string;
  risk: CodeRisk;
  scope: CodeScope;
  /** Present only when the table gives a known practical range; absent doesn't mean "no param". */
  param?: CodeParamRange;
  /** Whether a code picker UI should offer this code for insertion at all. */
  offerInMenu: boolean;
};

export type { CodeInfo, CodeParamRange, CodeRisk, CodeScope };

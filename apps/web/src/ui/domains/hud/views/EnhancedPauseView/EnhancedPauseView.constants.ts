/* @layer renderer-hud @kind constants */
/**
 * The chrome that never moves, in SNES pixels over the play field, plus the
 * menu's own words.
 *
 * The published measurements: a top strip for the vitals, a 16-pixel legend
 * along the bottom, and a column on the right holding the button map. That leaves
 * the screens 310 x 152 to work in at 16:9.
 *
 * THAT COLUMN IS NOT A NUMBER ANY MORE. It used to be an 80-pixel reserve with
 * a comment claiming the cluster was 72 wide, which had been false since the
 * d-pad group was added (contract section 15.5, open item 3). The menu now pins
 * the button map by the map's OWN measured bounds (the union of the rectangles
 * the layout engine reported for it), so there is nothing here to keep in step
 * with a shape the player can re-author. Only the two insets survive.
 *
 * The top strip is 56, not the 48 first published: the vitals reach y 44 and
 * the tab strip sits beside them. Everything the chrome claims is spelled out
 * below, with the arithmetic that fixes it.
 */
import { HUD_EDGE_INSET, VITALS_RESERVE } from '@shared/hud/layouts';
import type { PauseScreen } from '@shared/game/logic/pause';

/** Left inset shared by every screen panel. */
const MENU_INSET = HUD_EDGE_INSET;

/**
 * The tab strip sits BESIDE the vitals, not under them, and this is the whole
 * reason it has an x of its own.
 *
 * Do the arithmetic before moving either number. The vitals are an L: two 80-wide
 * rows down the left (hearts 6..22 at a full block, the meter 28..44) with the
 * 30-wide counts column beside the hearts at x 94, so the block reaches x 124 and
 * y 44. The panels start at y 56, and the strip is 9 tall (a 6px glyph, 2 of
 * padding, the 1px underline).
 *
 * A vertical answer was tried and cannot work. When the counts still stacked under
 * the meter the block reached y 74 (eighteen pixels PAST the panels' own origin)
 * and the column has only eight pixels of slack in total (the bottle box ends at
 * 200, the legend owns 208..224), so no offset exists that clears both. That is
 * why the counts moved sideways and the strip went beside instead of under.
 *
 * Beside them there is room to spare: the strip is 106 wide (ITEMS 30, GEAR 24,
 * STATUS 36, two 8px gaps) and the menu area runs to x 318, so 132..238 leaves
 * 80 px of air. And it is heart-count independent, which no vertical answer could
 * be: the two rectangles are disjoint on X, so the life block growing from one
 * heart row to two cannot reach the strip at any container count.
 */
const TABS_X = VITALS_RESERVE.x + VITALS_RESERVE.w + HUD_EDGE_INSET;   // 8 + 116 + 8 = 132
/** The tab strip, just above the panels: 46..55, one pixel clear of SCREEN_Y. */
const TABS_Y = 46;
/** Where a screen's own origin sits. */
const SCREEN_Y = 56;
/** What the button map keeps clear of the right edge and the top of the field.
 *  It is the same inset every other fixed element keeps. */
const CLUSTER_INSET = 8;
const CLUSTER_TOP = 8;

/** Screen names, in the order the shoulder buttons walk them. */
const SCREEN_TABS: readonly { id: PauseScreen; label: string }[] = [
  { id: 'items', label: 'ITEMS' },
  { id: 'gear', label: 'GEAR' },
  { id: 'status', label: 'STATUS' },
];

/** Ladder names on the gear screen, and the passive row's own heading. */
const GEAR_LABELS = { sword: 'BLADE', shield: 'GUARD', mail: 'ARMOR', bow: 'ARROWS', passive: 'HELD' } as const;

/**
 * Menu wording. Uppercase A-Z only: the menu draws text from the game's own
 * font sprites, which cover letters, digits, space and '&' and nothing else.
 */
const ASSIGN_HINT = 'PRESS A BUTTON TO ASSIGN';
const REFUSE_HINT = 'NOT FOUND YET';
const GEAR_HINT = 'FADED TIERS ARE NOT FOUND YET';
/**
 * How many characters of hint fit on one line: the 96-pixel portrait column
 * divided by the hint's half-tile glyph. The hint is CENTRED in that column, so
 * a line wider than this sticks out in both
 * directions and runs back across the panel beside it. Wrapping to this width
 * is what keeps it inside its own column on every screen that draws one.
 */
const HINT_COLUMNS = 16;
/**
 * The gear screen's two assignable rows say so out loud. They are the only home
 * the two gameplay verbs have. The ladders and the item grid put things on a
 * button, and these put the swing and the reach there, so a player who never
 * reads a menu still finds them by walking onto the row.
 */
const ASSIGN_BLADE_HINT = 'PRESS A BUTTON TO ASSIGN THE BLADE';
const ASSIGN_ACTION_HINT = 'PRESS A BUTTON TO ASSIGN THE ACTION';
/** How long a refusal stays up. Long enough to read, short enough to forget. */
const REFUSE_MS = 1600;

/**
 * Legend verbs, in the order the strip reads left to right.
 *
 * MAP is gone from it, and not because the strip ran out of room: the map button
 * raises no menu event whatever (`menu-edges.ts` emits none for it), so the row
 * named a control that does nothing on every screen it was drawn on. CONFIRM is
 * gone for a smaller reason. The word was accurate but never the
 * answer to "what would this do", which is the question a legend is for.
 */
const LEGEND_VERBS = {
  screen: 'SCREEN', move: 'MOVE', cancel: 'BACK', close: 'CLOSE', assign: 'ASSIGN',
} as const;

/**
 * What a confirm does, keyed by the confirm rule's own answer, so a new outcome
 * there cannot reach the strip without a word to print for it.
 */
const CONFIRM_VERBS = { equip: 'EQUIP', unequip: 'REMOVE', exit: 'ACTIVATE' } as const;

/**
 * The assign row's "control". Every other row names one button; this one names
 * none, because any button the menu is not already using will do. That is the
 * fact the row exists to teach.
 */
const ANY_BUTTON = 'ANY';

export {
  ANY_BUTTON, ASSIGN_ACTION_HINT, ASSIGN_BLADE_HINT, ASSIGN_HINT, CLUSTER_INSET, CLUSTER_TOP,
  CONFIRM_VERBS, GEAR_HINT, GEAR_LABELS, HINT_COLUMNS, LEGEND_VERBS,
  MENU_INSET, REFUSE_HINT, REFUSE_MS, SCREEN_TABS, SCREEN_Y, TABS_X, TABS_Y,
};

/* @layer renderer-components @kind constants */
/**
 * Measurements a submenu needs BEFORE it exists. Where a panel opens has to be
 * decided at the moment the pointer arrives, and a panel that has not been laid
 * out yet cannot be measured. So these mirror the stylesheet's own values, used
 * for one thing only: flipping a panel that would open off-screen.
 */

/** Mirrors `.dropdown-menu--sub`'s min-width. */
const SUB_MENU_WIDTH = 180;

/** One `.dropdown__item` row, near enough to guess a panel's height by. */
const SUB_ROW_HEIGHT = 30;

/** The panel's own vertical padding, top and bottom together. */
const SUB_MENU_PADDING = 8;

export { SUB_MENU_PADDING, SUB_MENU_WIDTH, SUB_ROW_HEIGHT };

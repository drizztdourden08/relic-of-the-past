/* @layer renderer-components @kind logic */
/**
 * THE GRID TOOLBAR'S ICONS, and why each one. §48 drew this toolbar with Unicode
 * characters (`⊞ ⊟ ⇤ ⇥ ⤒ ⤓ ✕`); the maintainer's verdict was "they suck", and
 * the reason is structural, not aesthetic. A text glyph is drawn by
 * whatever font the OS picked, at whatever weight, with no relation to the
 * fifteen other pictures around it. The project's convention is Lucide through
 * `@iconify/react`, which is one stroke weight at 16px and one visual family.
 *
 * THE APPEND PAIR IS NOT HERE ANY MORE (§54). §50 gave add-column and add-row
 * Lucide's `columns` / `rows` ("one more band, at the end, with no direction
 * implied") while they were buttons in this toolbar. They are the settings
 * panel's `TRACKS` row now, beside the count each one changes, where the word
 * `columns` is PRINTED and a second picture of a column would say it twice; the
 * icon there is a plain `plus`. Everything left in this file is contextual.
 *
 * THE INSERTS ARE DRAWN HERE, IN LUCIDE'S OWN GRAMMAR. Lucide's
 * `between-horizontal-*` family does not exist in the version this repo pins,
 * and the stand-in (`arrow-*-to-line`) collided the day the flex strip got the
 * same glyph for "move to the start": one picture, two meanings, in two sibling
 * toolbars. An insert is a TRACK and a PLUS on the side the new one lands, in a
 * 24px box with a 2px round `currentColor` stroke, exactly as the set draws.
 */
import arrowDown from '@iconify-icons/lucide/arrow-down';
import arrowDownToLine from '@iconify-icons/lucide/arrow-down-to-line';
import arrowLeft from '@iconify-icons/lucide/arrow-left';
import arrowLeftToLine from '@iconify-icons/lucide/arrow-left-to-line';
import arrowRight from '@iconify-icons/lucide/arrow-right';
import arrowRightToLine from '@iconify-icons/lucide/arrow-right-to-line';
import arrowUp from '@iconify-icons/lucide/arrow-up';
import arrowUpToLine from '@iconify-icons/lucide/arrow-up-to-line';
import trashIcon from '@iconify-icons/lucide/trash-2';
import type { IconifyIcon } from '@iconify/types';
import type { TrackAxis } from '../GridEditor.type';

const drawn = (shapes: string): IconifyIcon => ({
  width: 24,
  height: 24,
  body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">${shapes}</g>`,
});

const GRID_ICONS = {
  insertColumnBefore: drawn('<rect x="14" y="3" width="7" height="18" rx="1"/><path d="M3 12h6M6 9v6"/>'),
  insertColumnAfter: drawn('<rect x="3" y="3" width="7" height="18" rx="1"/><path d="M15 12h6M18 9v6"/>'),
  insertRowBefore: drawn('<rect x="3" y="14" width="18" height="7" rx="1"/><path d="M9 6h6M12 3v6"/>'),
  insertRowAfter: drawn('<rect x="3" y="3" width="18" height="7" rx="1"/><path d="M9 18h6M12 15v6"/>'),
  remove: trashIcon,
} as const;

/** Reordering is a direction, so the icon is the arrow the legend prints. */
const EARLIER_ICON: Record<TrackAxis, IconifyIcon> = { columns: arrowLeft, rows: arrowUp };
const LATER_ICON: Record<TrackAxis, IconifyIcon> = { columns: arrowRight, rows: arrowDown };

/** MOVE TO THE EDGE, which is a different sentence from "move one along" and
 *  needs a different picture: an arrow driving into the wall it stops at. It exists
 *  because in Round 21 the flex strip drew "later" and "to the end" as the same plain
 *  arrow, two buttons side by side that nobody could tell apart. */
const START_ICON: Record<TrackAxis, IconifyIcon> = { columns: arrowLeftToLine, rows: arrowUpToLine };
const END_ICON: Record<TrackAxis, IconifyIcon> = { columns: arrowRightToLine, rows: arrowDownToLine };

/** The cap the legend prints for the same move. One source serves both bands. */
const EARLIER_KEY: Record<TrackAxis, string> = { columns: '←', rows: '↑' };
const LATER_KEY: Record<TrackAxis, string> = { columns: '→', rows: '↓' };

export { EARLIER_ICON, EARLIER_KEY, END_ICON, GRID_ICONS, LATER_ICON, LATER_KEY, START_ICON };

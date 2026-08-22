/* @layer renderer-components @kind logic */
/**
 * The ONE place a control code or a token turns into a symbol. Toolbar buttons,
 * inline chips and legend rows all read from here, so the same thing is never
 * drawn two ways in the same line.
 *
 * The table maps NAMES ONLY — it is not a second catalog. Whether a code may be
 * offered, what it is called and what it does all come from the catalog in
 * `shared/game/language/codes`; a name missing from this table still works and
 * simply falls back to the neutral symbol.
 *
 * The three line-start markers deliberately share one symbol: they are the same
 * gesture aimed at a different row, and the row number is carried as a small
 * numeral beside the icon rather than by three shapes nobody can tell apart.
 */
import asteriskIcon from '@iconify-icons/lucide/asterisk';
import bookIcon from '@iconify-icons/lucide/book-marked';
import chevronsDownIcon from '@iconify-icons/lucide/chevrons-down';
import cornerDownLeftIcon from '@iconify-icons/lucide/corner-down-left';
import crosshairIcon from '@iconify-icons/lucide/crosshair';
import frameIcon from '@iconify-icons/lucide/frame';
import gamepadIcon from '@iconify-icons/lucide/gamepad-2';
import gaugeIcon from '@iconify-icons/lucide/gauge';
import hashIcon from '@iconify-icons/lucide/hash';
import hourglassIcon from '@iconify-icons/lucide/hourglass';
import imageIcon from '@iconify-icons/lucide/image';
import listChecksIcon from '@iconify-icons/lucide/list-checks';
import paletteIcon from '@iconify-icons/lucide/palette';
import panelTopIcon from '@iconify-icons/lucide/panel-top';
import scrollSpeedIcon from '@iconify-icons/lucide/arrow-down-narrow-wide';
import smileIcon from '@iconify-icons/lucide/smile';
import userIcon from '@iconify-icons/lucide/user';
import volumeIcon from '@iconify-icons/lucide/volume-2';
import type { IconifyIcon } from '@iconify/types';
import type { Token } from '@shared/game/language';

/** Keyed by the engine's own bracket name, so a catalog entry needs no second id. */
const CODE_ICONS: Record<string, IconifyIcon> = {
  1: cornerDownLeftIcon,
  2: cornerDownLeftIcon,
  3: cornerDownLeftIcon,
  Name: userIcon,
  Number: hashIcon,
  Waitkey: gamepadIcon,
  Wait: hourglassIcon,
  Speed: gaugeIcon,
  Color: paletteIcon,
  Window: frameIcon,
  Position: panelTopIcon,
  Scroll: chevronsDownIcon,
  ScrollSpd: scrollSpeedIcon,
  Sound: volumeIcon,
  NextPic: imageIcon,
  Choose: listChecksIcon,
  Choose2: listChecksIcon,
  Choose3: listChecksIcon,
  Selchg: listChecksIcon,
  Item: crosshairIcon,
};

/** Anything the table has no symbol for — including a code added later. */
const FALLBACK_ICON: IconifyIcon = asteriskIcon;

/** A reference to one of the set's reusable phrases. */
const GLOSSARY_ICON: IconifyIcon = bookIcon;

/** A picture character, on the rare surface that wants a symbol rather than the character. */
const GLYPH_ICON: IconifyIcon = smileIcon;

const iconForCodeName = (name: string): IconifyIcon => CODE_ICONS[name] ?? FALLBACK_ICON;

const iconForToken = (token: Token): IconifyIcon => {
  if (token.t === 'cmd') return iconForCodeName(token.name);
  if (token.t === 'break') return iconForCodeName(String(token.row));
  if (token.t === 'var') return iconForCodeName(token.name === 'player-name' ? 'Name' : 'Number');
  if (token.t === 'ref') return GLOSSARY_ICON;
  return FALLBACK_ICON;
};

export { FALLBACK_ICON, GLOSSARY_ICON, GLYPH_ICON, iconForCodeName, iconForToken };

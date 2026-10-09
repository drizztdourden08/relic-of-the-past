/* @layer renderer-components @kind constants */
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

const FALLBACK_ICON: IconifyIcon = asteriskIcon;

const GLOSSARY_ICON: IconifyIcon = bookIcon;

const GLYPH_ICON: IconifyIcon = smileIcon;

export { CODE_ICONS, FALLBACK_ICON, GLOSSARY_ICON, GLYPH_ICON };

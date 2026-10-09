/* @layer renderer-components @kind constants */
import arrowDown from '@iconify-icons/lucide/arrow-down';
import arrowDownToLine from '@iconify-icons/lucide/arrow-down-to-line';
import arrowLeft from '@iconify-icons/lucide/arrow-left';
import arrowLeftToLine from '@iconify-icons/lucide/arrow-left-to-line';
import arrowRight from '@iconify-icons/lucide/arrow-right';
import arrowRightToLine from '@iconify-icons/lucide/arrow-right-to-line';
import arrowUp from '@iconify-icons/lucide/arrow-up';
import arrowUpToLine from '@iconify-icons/lucide/arrow-up-to-line';
import trashIcon from '@iconify-icons/lucide/trash-2';
import { drawn } from './drawn';
import type { IconifyIcon } from '@iconify/types';
import type { TrackAxis } from '../../GridEditor.type';

const GRID_ICONS = {
  insertColumnBefore: drawn('<rect x="14" y="3" width="7" height="18" rx="1"/><path d="M3 12h6M6 9v6"/>'),
  insertColumnAfter: drawn('<rect x="3" y="3" width="7" height="18" rx="1"/><path d="M15 12h6M18 9v6"/>'),
  insertRowBefore: drawn('<rect x="3" y="14" width="18" height="7" rx="1"/><path d="M9 6h6M12 3v6"/>'),
  insertRowAfter: drawn('<rect x="3" y="3" width="18" height="7" rx="1"/><path d="M9 18h6M12 15v6"/>'),
  remove: trashIcon,
} as const;

const EARLIER_ICON: Record<TrackAxis, IconifyIcon> = { columns: arrowLeft, rows: arrowUp };
const LATER_ICON: Record<TrackAxis, IconifyIcon> = { columns: arrowRight, rows: arrowDown };

const START_ICON: Record<TrackAxis, IconifyIcon> = { columns: arrowLeftToLine, rows: arrowUpToLine };
const END_ICON: Record<TrackAxis, IconifyIcon> = { columns: arrowRightToLine, rows: arrowDownToLine };

const EARLIER_KEY: Record<TrackAxis, string> = { columns: '←', rows: '↑' };
const LATER_KEY: Record<TrackAxis, string> = { columns: '→', rows: '↓' };

export { EARLIER_ICON, EARLIER_KEY, END_ICON, GRID_ICONS, LATER_ICON, LATER_KEY, START_ICON };

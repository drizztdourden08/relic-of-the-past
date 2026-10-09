/* @layer renderer-components @kind logic */
import type { IconifyIcon } from '@iconify/types';
import { CODE_ICONS, FALLBACK_ICON } from './icon-for-token.constants';

const iconForCodeName = (name: string): IconifyIcon => CODE_ICONS[name] ?? FALLBACK_ICON;

export { iconForCodeName };

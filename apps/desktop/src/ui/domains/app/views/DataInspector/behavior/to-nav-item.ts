/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { FALLBACK_NAV_ICON, NAV_ICONS } from '../DataInspector.constants';

const toNavItem = (item: { id: string; label: string }) => ({
  id: item.id,
  label: item.label,
  icon: createElement(IconifyIcon, { icon: NAV_ICONS[item.id] ?? FALLBACK_NAV_ICON }),
});

export { toNavItem };

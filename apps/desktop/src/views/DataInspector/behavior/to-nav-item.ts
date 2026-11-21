/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { FALLBACK_NAV_ICON, NAV_ICONS } from '../DataInspector.constants';

const toNavItem = (text: (value: Message) => string) => (item: { id: string; label: Message }) => ({
  id: item.id,
  label: text(item.label),
  icon: createElement(IconifyIcon, { icon: NAV_ICONS[item.id] ?? FALLBACK_NAV_ICON }),
});

export { toNavItem };

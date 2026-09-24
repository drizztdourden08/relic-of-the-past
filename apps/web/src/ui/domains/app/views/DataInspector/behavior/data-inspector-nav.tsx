/* @layer renderer-app @kind data */
/** The inspector's side nav: the eleven collections, then the review pass on its own. */
import { Icon as IconifyIcon, type IconifyIcon as IconData } from '@iconify/react/offline';
import mapIcon from '@iconify-icons/lucide/map';
import linkIcon from '@iconify-icons/lucide/link';
import pinIcon from '@iconify-icons/lucide/map-pin';
import backpackIcon from '@iconify-icons/lucide/backpack';
import castleIcon from '@iconify-icons/lucide/castle';
import globeIcon from '@iconify-icons/lucide/globe';
import flagIcon from '@iconify-icons/lucide/flag';
import ghostIcon from '@iconify-icons/lucide/ghost';
import tagIcon from '@iconify-icons/lucide/tag';
import boxesIcon from '@iconify-icons/lucide/boxes';
import typeIcon from '@iconify-icons/lucide/type';
import alertIcon from '@iconify-icons/lucide/alert-triangle';
import type { SectionNavConfig } from '@ds/composites/SectionNav';
import { KIND_NAV_ITEMS, RECOMMENDATIONS_NAV_ITEM } from '../DataInspector.constants';

const KIND_ICONS: Record<string, IconData> = {
  screen: mapIcon,
  connection: linkIcon,
  check: pinIcon,
  item: backpackIcon,
  dungeon: castleIcon,
  area: globeIcon,
  location: flagIcon,
  actor: ghostIcon,
  tag: tagIcon,
  'item-group': boxesIcon,
  enumeration: typeIcon,
  [RECOMMENDATIONS_NAV_ITEM.id]: alertIcon,
};

const toNavItem = (item: { id: string; label: string }) => ({
  id: item.id,
  label: item.label,
  icon: <IconifyIcon icon={KIND_ICONS[item.id] ?? typeIcon} />,
});

const DATA_INSPECTOR_NAV: SectionNavConfig = {
  groups: [
    { id: 'records', label: 'Records', items: KIND_NAV_ITEMS.map(toNavItem) },
    { id: 'review', label: 'Review', items: [toNavItem(RECOMMENDATIONS_NAV_ITEM)] },
  ],
};

export { DATA_INSPECTOR_NAV };

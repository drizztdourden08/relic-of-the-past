/* @layer renderer-app @kind constants */
import type { SideNavConfig } from '@drizztdourden08/tessera/composites';
import { KIND_NAV_ITEMS, RECOMMENDATIONS_NAV_ITEM } from '../DataInspector.constants';
import { toNavItem } from './to-nav-item';

const DATA_INSPECTOR_NAV: SideNavConfig = {
  groups: [
    { id: 'records', label: 'Records', items: KIND_NAV_ITEMS.map(toNavItem) },
    { id: 'review', label: 'Review', items: [toNavItem(RECOMMENDATIONS_NAV_ITEM)] },
  ],
};

export { DATA_INSPECTOR_NAV };

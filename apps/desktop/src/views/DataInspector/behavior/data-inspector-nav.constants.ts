/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { SideNavConfig } from '@drizztdourden08/tessera/composites';
import { KIND_NAV_ITEMS, RECOMMENDATIONS_NAV_ITEM } from '../DataInspector.constants';
import { toNavItem } from './to-nav-item';

const RECORDS_GROUP = msg('views-data-inspector:nav.records');
const REVIEW_GROUP = msg('views-data-inspector:nav.review');

const dataInspectorNav = (text: (value: Message) => string): SideNavConfig => ({
  groups: [
    { id: 'records', label: text(RECORDS_GROUP), items: KIND_NAV_ITEMS.map(toNavItem(text)) },
    { id: 'review', label: text(REVIEW_GROUP), items: [toNavItem(text)(RECOMMENDATIONS_NAV_ITEM)] },
  ],
});

export { dataInspectorNav };

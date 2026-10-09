/* @layer store-site @kind logic */
import type { HeaderAnchorNavItem } from '@drizztdourden08/tessera/composites';
import type { ItemCardView } from '@shared/store/home-types';
import { KIND_PLURALS, STORE_KINDS } from '../../../../lib/kinds';
import { ALL_TAB } from './kind-tabs.constants';

const kindTabs = (items: readonly ItemCardView[]): HeaderAnchorNavItem[] => [
  { id: ALL_TAB, label: 'All', badge: items.length },
  ...STORE_KINDS.map((kind) => ({
    id: kind,
    label: KIND_PLURALS[kind],
    badge: items.filter((item) => item.kind === kind).length,
  })),
];

export { kindTabs };

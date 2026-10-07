/* @layer store-site @kind logic */
/**
 * The kind tabs over the catalogue: All, then one per kind, each with its count. A tab is a
 * place, so picking one goes to that kind's section and the nav follows.
 */
import type { HeaderTabItem } from '@ds/composites/HeaderTabs';
import type { ItemCardView } from '@shared/store/home-types';
import type { StoreKind } from '@shared/store/types';
import { KIND_PLURALS, KIND_SECTIONS, STORE_KINDS } from '../../../lib/kinds';

const ALL_TAB = 'all';

const kindTabs = (items: readonly ItemCardView[]): HeaderTabItem[] => [
  { id: ALL_TAB, label: 'All', badge: items.length },
  ...STORE_KINDS.map((kind) => ({
    id: kind,
    label: KIND_PLURALS[kind],
    badge: items.filter((item) => item.kind === kind).length,
  })),
];

const tabIdOf = (kind: StoreKind | null): string => kind ?? ALL_TAB;

/** The list path a tab stands for: /browse for All, /<kind section> for a kind. */
const tabPath = (tabId: string): string => {
  const kind = STORE_KINDS.find((entry) => entry === tabId);
  return kind ? `/${KIND_SECTIONS[kind]}` : '/browse';
};

export { kindTabs, tabIdOf, tabPath };

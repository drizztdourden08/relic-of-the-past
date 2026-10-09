/* @layer store-site @kind logic */
import type { HeaderTabItem } from '@ds/composites/HeaderTabs';
import type { StoreItem } from '@shared/store/types';
import { PUBLICATION_SCOPES } from './publication-scopes.constants';
import { scopePredicate } from './scope-predicate';

const publicationTabs = (items: readonly StoreItem[]): HeaderTabItem[] =>
  PUBLICATION_SCOPES.map((scope) => ({ id: scope.id, label: scope.label, badge: items.filter(scopePredicate(scope.id)).length }));

export { publicationTabs };

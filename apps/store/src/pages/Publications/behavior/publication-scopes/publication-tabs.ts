/* @layer store-site @kind logic */
import type { HeaderAnchorNavItem } from '@drizztdourden08/tessera/composites';
import type { StoreItem } from '@rotp/hub-contracts';
import { PUBLICATION_SCOPES } from './publication-scopes.constants';
import { scopePredicate } from './scope-predicate';

const publicationTabs = (items: readonly StoreItem[]): HeaderAnchorNavItem[] =>
  PUBLICATION_SCOPES.map((scope) => ({ id: scope.id, label: scope.label, badge: items.filter(scopePredicate(scope.id)).length }));

export { publicationTabs };

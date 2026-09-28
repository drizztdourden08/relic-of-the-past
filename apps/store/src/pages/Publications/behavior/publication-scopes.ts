/* @layer store-site @kind logic */
/**
 * The My publications tabs over the player's items: the predicate one tab stands for, and a
 * tab per scope with the number of items in it. Ready, Waiting and Rejected look at every
 * version (and, for the last two, listing edit) of an item; Published and Drafts at the item
 * itself. Ready counts only versions whose file is still kept, since those can be sent.
 */
import type { HeaderTabItem } from '@ds/composites/HeaderTabs';
import type { StoreItem } from '@shared/store/types';

type ItemPredicate = (item: StoreItem) => boolean;

const PUBLICATION_SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'ready', label: 'Ready' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'published', label: 'Published' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'drafts', label: 'Drafts' },
] as const;

const hasEntryIn = (item: StoreItem, state: 'waiting' | 'rejected') =>
  item.versions.some((v) => v.review.state === state) || item.listingEdits.some((edit) => edit.review.state === state);

const hasReadyVersion = (item: StoreItem) => item.versions.some((v) => v.review.state === 'ready' && !v.removed);

const scopePredicate = (scopeId: string): ItemPredicate => {
  switch (scopeId) {
    case 'ready': return hasReadyVersion;
    case 'waiting': return (item) => hasEntryIn(item, 'waiting');
    case 'published': return (item) => item.status === 'published';
    case 'rejected': return (item) => hasEntryIn(item, 'rejected');
    case 'drafts': return (item) => item.status === 'draft';
    default: return () => true;
  }
};

const publicationTabs = (items: readonly StoreItem[]): HeaderTabItem[] =>
  PUBLICATION_SCOPES.map((scope) => ({ id: scope.id, label: scope.label, badge: items.filter(scopePredicate(scope.id)).length }));

export { scopePredicate, publicationTabs };

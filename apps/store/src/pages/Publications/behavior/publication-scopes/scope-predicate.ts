/* @layer store-site @kind logic */
import type { StoreItem } from '@shared/store/types';
import type { ItemPredicate } from './publication-scopes.type';

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

export { scopePredicate };

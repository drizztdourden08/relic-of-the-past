/* @layer store-api @kind logic */
import { hasRight } from '../../../../../shared/hub/rights';
import type { StoreItem } from '../../../../../shared/store/types';
import type { Actor } from '../../../../../shared/store/version-flow';
import { isAuthor } from './is-author';
import type { Viewer } from './project-item.type';

const actorsOf = (item: Pick<StoreItem, 'author'>, viewer: Viewer): Actor[] => [
  ...(isAuthor(item, viewer) ? ['author' as const] : []),
  ...(hasRight(viewer.rights, 'review') ? ['reviewer' as const] : []),
];

export { actorsOf };

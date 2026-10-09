/* @layer store-api @kind logic */
import { hasRight } from '@rotp/hub-contracts';
import type { StoreItem } from '@rotp/hub-contracts';
import type { Actor } from '@rotp/hub-contracts';
import { isAuthor } from './is-author';
import type { Viewer } from './project-item.type';

const actorsOf = (item: Pick<StoreItem, 'author'>, viewer: Viewer): Actor[] => [
  ...(isAuthor(item, viewer) ? ['author' as const] : []),
  ...(hasRight(viewer.rights, 'review') ? ['reviewer' as const] : []),
];

export { actorsOf };

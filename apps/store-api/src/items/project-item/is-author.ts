/* @layer store-api @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import type { Viewer } from './project-item.type';

const isAuthor = (item: Pick<StoreItem, 'author'>, viewer: Viewer): boolean => viewer.caller.userId === item.author.userId;

export { isAuthor };

/* @layer electron-main @kind logic */
import type { CatalogPage } from '@drizztdourden08/brock-catalog/main';
import type { ItemsListResponse } from '@rotp/hub-contracts';
import { ANSWER_UNREADABLE } from '../hookshop.constants';
import { isObject } from './is-object';

const isCard = (value: unknown): boolean => isObject(value) && typeof value.id === 'string';

const parsePage = (value: unknown): CatalogPage => {
  if (!isObject(value) || !Array.isArray(value.items) || !value.items.every(isCard)) throw new Error(ANSWER_UNREADABLE);
  if (value.nextCursor !== null && typeof value.nextCursor !== 'string') throw new Error(ANSWER_UNREADABLE);
  return value as ItemsListResponse;
};

export { parsePage };

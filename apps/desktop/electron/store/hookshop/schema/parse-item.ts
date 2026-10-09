/* @layer electron-main @kind logic */
import type { CatalogItem } from '@drizztdourden08/brock-catalog/main';
import type { ItemResponse } from '@shared/store/api-types';
import { ANSWER_UNREADABLE } from '../hookshop.constants';
import { isObject } from './is-object';

const parseItem = (value: unknown): CatalogItem => {
  if (!isObject(value) || !isObject(value.item) || typeof value.item.id !== 'string') throw new Error(ANSWER_UNREADABLE);
  const answer = value as ItemResponse;
  return { ...answer, id: answer.item.id };
};

export { parseItem };

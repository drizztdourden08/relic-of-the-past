/* @layer electron-main @kind logic */
import { mainText } from '../../../lib/main-text';
import type { CatalogItem } from '@drizztdourden08/brock-catalog/main';
import type { ItemResponse } from '@rotp/hub-contracts';
import { ANSWER_UNREADABLE } from '../hookshop.constants';
import { isObject } from './is-object';

const parseItem = (value: unknown): CatalogItem => {
  if (!isObject(value) || !isObject(value.item) || typeof value.item.id !== 'string') throw new Error(mainText(ANSWER_UNREADABLE));
  const answer = value as ItemResponse;
  return { ...answer, id: answer.item.id };
};

export { parseItem };

/* @layer electron-main @kind logic */
import type { HomeResponse } from '@rotp/hub-contracts';
import { ANSWER_UNREADABLE, HOME_SHELVES } from '../hookshop.constants';
import { isObject } from './is-object';

const parseHome = (value: unknown): HomeResponse => {
  if (!isObject(value) || typeof value.welcome !== 'string') throw new Error(ANSWER_UNREADABLE);
  if (!HOME_SHELVES.every((shelf) => Array.isArray(value[shelf]))) throw new Error(ANSWER_UNREADABLE);
  return value as HomeResponse;
};

export { parseHome };

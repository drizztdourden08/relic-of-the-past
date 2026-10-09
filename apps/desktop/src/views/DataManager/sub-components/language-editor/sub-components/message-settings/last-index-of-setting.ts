/* @layer renderer-components @kind logic */
import { isSetting } from './is-setting';
import type { Token } from '@rotp/languages';

const lastIndexOfSetting = (tokens: Token[], name: string): number => {
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    if (isSetting(tokens[index], name)) return index;
  }
  return -1;
};

export { lastIndexOfSetting };

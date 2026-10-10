/* @layer renderer-components @kind logic */
import { isSetting } from './is-setting';
import type { Token } from '@rotp/languages';

const lastIndexOfSetting = (tokens: Token[], name: string): number => {
  for (const [index, token] of [...tokens.entries()].reverse()) {
    if (isSetting(token, name)) return index;
  }
  return -1;
};

export { lastIndexOfSetting };

/* @layer renderer-components @kind logic */
import { isSetting } from './is-setting';
import { lastIndexOfSetting } from './last-index-of-setting';
import type { Token } from '@rotp/languages';

const setMessageSetting = (tokens: Token[], name: string, param: number): Token[] => {
  const last = lastIndexOfSetting(tokens, name);
  if (last < 0) return [...tokens, { t: 'cmd', name, param }];
  return tokens
    .filter((token, index) => index === last || !isSetting(token, name))
    .map((token) => (isSetting(token, name) ? { t: 'cmd', name, param } : token));
};

export { setMessageSetting };

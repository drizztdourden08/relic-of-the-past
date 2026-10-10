/* @layer renderer-components @kind logic */
import { isSetting } from './is-setting';
import type { Token } from '@rotp/languages';

const clearMessageSetting = (tokens: Token[], name: string): Token[] =>
  tokens.filter((token) => !isSetting(token, name));

export { clearMessageSetting };

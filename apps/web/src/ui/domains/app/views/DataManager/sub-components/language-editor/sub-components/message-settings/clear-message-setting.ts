/* @layer renderer-components @kind logic */
import { isSetting } from './is-setting';
import type { Token } from '@shared/game/language';

const clearMessageSetting = (tokens: Token[], name: string): Token[] =>
  tokens.filter((token) => !isSetting(token, name));

export { clearMessageSetting };

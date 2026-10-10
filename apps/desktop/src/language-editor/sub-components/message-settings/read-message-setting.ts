/* @layer renderer-components @kind logic */
import { lastIndexOfSetting } from './last-index-of-setting';
import type { Token } from '@rotp/languages';

const readMessageSetting = (tokens: Token[], name: string): number | null => {
  const index = lastIndexOfSetting(tokens, name);
  const token = tokens[index];
  if (token === undefined) return null;
  return token.t === 'cmd' ? token.param ?? null : null;
};

export { readMessageSetting };

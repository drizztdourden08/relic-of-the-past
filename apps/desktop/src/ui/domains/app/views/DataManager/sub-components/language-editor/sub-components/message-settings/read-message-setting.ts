/* @layer renderer-components @kind logic */
import { lastIndexOfSetting } from './last-index-of-setting';
import type { Token } from '@rotp/languages';

const readMessageSetting = (tokens: Token[], name: string): number | null => {
  const index = lastIndexOfSetting(tokens, name);
  if (index < 0) return null;
  const token = tokens[index];
  return token.t === 'cmd' ? token.param ?? null : null;
};

export { readMessageSetting };

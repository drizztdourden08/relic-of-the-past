/* @layer renderer-components @kind logic */
import type { Token, VariableIndex } from '@rotp/languages';
import { proseOf } from './entry-prose';

const excerptOf = (tokens: Token[], index: VariableIndex, limit: number): string => {
  const line = proseOf(tokens, index).replace(/\s+/g, ' ').trim();
  return line.length <= limit ? line : `${line.slice(0, limit).trimEnd()}...`;
};

export { excerptOf };

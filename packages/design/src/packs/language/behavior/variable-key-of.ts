/* @layer renderer-components @kind logic */
import type { Token } from '@rotp/languages';

const variableKeyOf = (token: Token): string | null => {
  if (token.t === 'ref') return token.key;
  return token.t === 'var' ? token.name : null;
};

export { variableKeyOf };

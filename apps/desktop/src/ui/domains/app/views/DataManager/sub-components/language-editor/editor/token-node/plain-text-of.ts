/* @layer renderer-components @kind logic */
import { serializeTokens } from '@rotp/languages';
import { tokenFromAttrs } from '../attrs-to-token';

const plainTextOf = (attrs: Record<string, unknown> | null | undefined): string => {
  const token = tokenFromAttrs(attrs);
  if (token === null) return '';
  if (token.t === 'ref') return `{${token.key}}`;
  return serializeTokens([token]);
};

export { plainTextOf };

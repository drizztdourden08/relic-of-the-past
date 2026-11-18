/* @layer shared-game @kind logic */
import type { OptionTextResolver } from './option-text.type';

const keyOf: OptionTextResolver = (text) => (typeof text === 'string' ? text : text.key);

const optionTextHolder: { resolve: OptionTextResolver } = { resolve: keyOf };

export { optionTextHolder };

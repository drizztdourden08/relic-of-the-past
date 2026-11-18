/* @layer shared-game @kind logic */
import type { OptionTextResolver } from './option-text.type';

const keyOf: OptionTextResolver = (text) => (typeof text === 'string' ? text : text.key);

const exportOptionTextHolder: { resolve: OptionTextResolver } = { resolve: keyOf };

export { exportOptionTextHolder };

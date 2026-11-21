/* @layer renderer-app @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';

const keyOf = (text: Text): string => (typeof text === 'string' ? text : text.key);

const textHolder: { resolve: (text: Text) => string } = { resolve: keyOf };

export { textHolder };

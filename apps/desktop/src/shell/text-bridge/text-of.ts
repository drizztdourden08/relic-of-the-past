/* @layer renderer-app @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { textHolder } from './text-holder';

const textOf = (text: Text): string => textHolder.resolve(text);

export { textOf };

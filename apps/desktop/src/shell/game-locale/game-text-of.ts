/* @layer renderer-app @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { gameI18n } from './game-i18n';

const gameTextOf = (text: Text): string => gameI18n.text(text);

export { gameTextOf };

/* @layer shared-game @kind logic */
import { isMessageKey } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';

const spriteNameOf = (file: string, label: Text): Text => {
  const key = `game-labels:sprite.name.${file}`;
  return typeof label === 'string' && isMessageKey(key) ? { key } : label;
};

export { spriteNameOf };

/* @layer shared-game @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';

const spriteNameOf = (file: string, label: Text): Text =>
  typeof label === 'string' ? { key: `game-labels:sprite.name.${file}` } : label;

export { spriteNameOf };

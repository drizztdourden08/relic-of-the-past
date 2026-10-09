/* @layer shared-game @kind logic */
import { spriteSource } from './sprite-source';

const spriteUrlOf = (filename: string): string =>
  `${spriteSource.base}${filename}.png${spriteSource.revision > 0 ? `?v=${spriteSource.revision}` : ''}`;

export { spriteUrlOf };

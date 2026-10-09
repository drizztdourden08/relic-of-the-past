/* @layer shared-game @kind logic */
import { TOKEN_BASE } from './dialogue-charset.constants';

const extraTokenOf = (slot: number): string => String.fromCodePoint(TOKEN_BASE + slot);

export { extraTokenOf };

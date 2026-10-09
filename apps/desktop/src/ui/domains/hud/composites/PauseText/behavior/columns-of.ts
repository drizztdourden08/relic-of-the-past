/* @layer renderer-hud @kind logic */
import { AMPERSAND_COLUMNS } from '../PauseText.constants';

const columnsOf = (char: string): number => (char === '&' ? AMPERSAND_COLUMNS : 1);

export { columnsOf };

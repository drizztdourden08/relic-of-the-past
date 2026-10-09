/* @layer shared-game @kind logic */
import { primary } from '../highlight-markup';

const renderFromServer = (item: string): string => `The server sent you ${primary(item)}!`;

export { renderFromServer };

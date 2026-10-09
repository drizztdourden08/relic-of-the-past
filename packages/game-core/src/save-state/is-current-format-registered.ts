/* @layer shared-game @kind logic */
import { CURRENT_STATE_FORMAT } from './current-format.constants';
import { formatById } from './format-by-id';

const isCurrentFormatRegistered = (): boolean => formatById(CURRENT_STATE_FORMAT.id) !== null;

export { isCurrentFormatRegistered };

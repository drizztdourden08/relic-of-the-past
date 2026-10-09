/* @layer renderer-hud @kind logic */
import { AMPERSAND_COLS } from '../../PauseMenuView.constants';

const nameColumns = (text: string): number =>
  [...text].reduce((cols, char) => cols + (char === '&' ? AMPERSAND_COLS : 1), 0);

export { nameColumns };

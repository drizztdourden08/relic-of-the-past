/* @layer bridge-wasm @kind logic */
import { FOREIGN_ICON_FIRST_ID, FOREIGN_ICON_LAST_ID } from './foreign-item-sentinel';

const isForeignIconId = (id: number): boolean => id >= FOREIGN_ICON_FIRST_ID && id <= FOREIGN_ICON_LAST_ID;

export { isForeignIconId };

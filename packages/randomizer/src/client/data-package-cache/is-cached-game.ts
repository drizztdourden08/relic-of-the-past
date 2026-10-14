/* @layer bridge-wasm @kind logic */
import type { ApGameData } from '../ap-protocol.type';

const isCachedGame = (value: unknown): value is ApGameData =>
  typeof value === 'object' && value !== null
  && typeof (value as { item_name_to_id?: unknown }).item_name_to_id === 'object';

export { isCachedGame };

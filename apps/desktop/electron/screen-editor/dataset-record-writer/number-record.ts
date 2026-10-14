/* @layer electron-main @kind logic */
import type { Unnumbered } from '@rotp/game-data';

const numberRecord = <T extends { id: string }>(id: string, record: Unnumbered<T>): T =>
  ({ id, ...record }) as T;

export { numberRecord };

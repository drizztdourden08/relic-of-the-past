/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@shared/game/data';

const eventCheckRecords = (checkRecords: readonly CheckRecord[]): CheckRecord[] =>
  checkRecords.filter((check) => check.kind === 'event');

export { eventCheckRecords };

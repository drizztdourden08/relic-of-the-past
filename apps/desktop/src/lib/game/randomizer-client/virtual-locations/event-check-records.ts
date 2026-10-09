/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@rotp/game-data';

const eventCheckRecords = (checkRecords: readonly CheckRecord[]): CheckRecord[] =>
  checkRecords.filter((check) => check.kind === 'event');

export { eventCheckRecords };

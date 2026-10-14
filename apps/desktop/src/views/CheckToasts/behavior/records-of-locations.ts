/* @layer renderer-components @kind logic */
import type { CheckRecord } from '@rotp/game-data';
import type { LocationKey } from '@rotp/randomizer';
import { recordOfLocation } from './record-of-location';

const isRecord = (row: CheckRecord | undefined): row is CheckRecord => row !== undefined;

const recordsOfLocations = (names: readonly LocationKey[]): CheckRecord[] => names.map(recordOfLocation).filter(isRecord);

export { recordsOfLocations };

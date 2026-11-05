/* @layer renderer-app @kind logic */
import { find } from '@rotp/game-data';
import { checkIdOfLocation } from '@rotp/randomizer';
import type { CheckRecord } from '@rotp/game-data';
import type { LocationKey } from '@rotp/randomizer';

let byId: ReadonlyMap<string, CheckRecord> | null = null;

const recordsById = (): ReadonlyMap<string, CheckRecord> => {
  byId ??= new Map(find('check', () => true).map((record) => [record.id, record]));
  return byId;
};

const trackerCheckOf = (key: string): CheckRecord | undefined =>
  recordsById().get(checkIdOfLocation(key as LocationKey) ?? key);

export { trackerCheckOf };

/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomRecord } from '../dungeon/model';

const serializeSecretList = (room: DungeonRoomRecord): Buffer => Buffer.concat([
  ...room.secrets.map(secret => Buffer.from(secret.nativeBytes)),
  Buffer.from([0xff, 0xff]),
]);

export { serializeSecretList };

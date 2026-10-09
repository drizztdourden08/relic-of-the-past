/* @layer renderer-widgets @kind logic */
import { connectionTagKeysOf, toScreenIdOf } from '@rotp/game-data';
import type { ConnectionRecord } from '@rotp/game-data';
import { buildConnectionNav } from '@rotp/navigation';
import { known, unread } from '@rotp/navigation';
import type { ScreenObservations } from '@rotp/navigation';
import { findFloodForTarget } from '../../../../connection-tile-display';

const readNavProbe = (observations: ScreenObservations, record: ConnectionRecord) => {
  const info = findFloodForTarget([...observations.floodConnections], toScreenIdOf(record));
  return info ? known(buildConnectionNav(info, connectionTagKeysOf(record.tags))) : unread();
};

export { readNavProbe };

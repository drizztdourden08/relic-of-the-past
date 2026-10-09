/* @layer renderer-widgets @kind logic */
import { connectionTagKeysOf, toScreenIdOf } from '@shared/game/data';
import type { ConnectionRecord } from '@shared/game/data';
import { buildConnectionNav } from '@shared/game/navigation/analysis/connection-nav-from-flood';
import { known, unread } from '@shared/game/recommendations/compare';
import type { ScreenObservations } from '@shared/game/recommendations';
import { findFloodForTarget } from '../../../../connection-tile-display';

const readNavProbe = (observations: ScreenObservations, record: ConnectionRecord) => {
  const info = findFloodForTarget([...observations.floodConnections], toScreenIdOf(record));
  return info ? known(buildConnectionNav(info, connectionTagKeysOf(record.tags))) : unread();
};

export { readNavProbe };

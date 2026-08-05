/* @layer renderer-widgets @kind data */
/**
 * Field probe for the tile-data fix `connection-shape.ts` used to compute by
 * hand. Where the crossing physically sits, derived from the live flood
 * crossing — flood evidence proves presence only, so this is `likely`, never
 * `certain`.
 *
 * `applies` reproduces `connection-shape.ts`'s two guards exactly: a record
 * that already has `nav` is complete regardless of what the display is doing,
 * and an endpoint that does not resolve to a real screen gets no fix at all —
 * inventing one is the one thing the connection path refuses to do.
 */
import { connectionTagKeysOf, findOne } from '@shared/game/data';
import { toScreenIdOf } from '@shared/game/data/connections/derive';
import type { ConnectionRecord } from '@shared/game/data';
import { buildConnectionNav } from '@shared/game/navigation/analysis/connection-nav-from-flood';
import { known, unread } from '@shared/game/recommendations/compare';
import type { FieldProbe } from '@shared/game/recommendations/compare';
import { findFloodForTarget } from '../../../connection-tile-display';

const screenExists = (id: string): boolean => findOne('screen', s => s.id === id) != null;

const endpointsResolvable = (record: ConnectionRecord): boolean =>
  screenExists(record.screenId) && screenExists(toScreenIdOf(record));

const NAV_PROBE: FieldProbe<'connection'> = {
  path: 'nav',
  label: 'Tile data',
  source: 'flood:crossing',
  confidence: 'likely',
  applies: (observations, record) => !record.nav && endpointsResolvable(record),
  read: (observations, record) => {
    const info = findFloodForTarget([...observations.floodConnections], toScreenIdOf(record));
    return info ? known(buildConnectionNav(info, connectionTagKeysOf(record.tags))) : unread();
  },
};

export { NAV_PROBE, endpointsResolvable };

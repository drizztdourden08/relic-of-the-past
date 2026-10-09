/* @layer shared-game @kind types */
import type { ConnectionNavData } from '../nav-data.types';
import type { ScreenConnection } from '../../types';
import type { ResolvedEntrance } from './entrance-resolver.type';
import type { BorderBundle } from './border-bundles';

interface ConnectionNavUpdate {
  from: string;
  to: string;
  nav: ConnectionNavData;
}

interface ConnectionUpdaterInput {
  connections: ScreenConnection[];
  borderBundles: Map<number, BorderBundle[]>;
  overlapByKey: Map<string, number[]>;
  resolvedEntrances: ResolvedEntrance[];
  screenIndexMap: Map<string, number>;
}

export type { ConnectionNavUpdate, ConnectionUpdaterInput };

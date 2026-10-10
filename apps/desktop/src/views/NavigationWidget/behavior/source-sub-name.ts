/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo } from '@rotp/game-core';
import type { ScreenBundleGrid } from '@rotp/game-data';

const sourceSubName = (conn: ConnectionInfo, bundle: ScreenBundleGrid): string =>
  (conn.sourceScreen === undefined ? undefined : bundle.subNames[conn.sourceScreen]) ?? '?';

export { sourceSubName };

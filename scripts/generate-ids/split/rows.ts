/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Seed record → (target file, v8 record). One function per kind; each returns
 * plain objects in the new shape with every derived field already filled in.
 */
import { checkFile, connectionFile, itemFile, screenFile } from './layout';
import { connectionKind, dungeonIdOf, keptTags, placementOf } from './transform';
import type { Geography } from './layout';
import type { Loose, SeedCheck, SeedConnection, SeedItem, SeedScreen } from './seed-types';

interface Row {
  file: string;
  record: Loose;
}

const screenRows = (screens: readonly SeedScreen[], geo: Geography): Row[] =>
  screens.map(screen => ({ file: screenFile(screen, geo), record: { ...screen } }));

interface ConnectionContext {
  geo: Geography;
  kindOf: (c: SeedConnection) => string;
  pairs: ReadonlyMap<string, string>;
}

const connectionRows = (connections: readonly SeedConnection[], ctx: ConnectionContext): Row[] => {
  const { geo, kindOf, pairs } = ctx;
  return connections.map(c => {
    const { side, tileRange, ...rest } = c as Loose;
    void side;
    void tileRange;
    return {
      file: connectionFile(c.fromScreenId, c.toScreenId, geo),
      record: {
        ...rest,
        kind: kindOf(c),
        placement: placementOf(c),
        counterpartId: pairs.get(c.id),
        dungeonId: dungeonIdOf(c, geo),
        tags: keptTags(c.tags),
      },
    };
  });
};

const checkRows = (checks: readonly SeedCheck[], worldOf: (c: SeedCheck) => 'light' | 'dark'): Row[] =>
  checks.map(check => ({ file: checkFile(check, worldOf), record: { ...check } }));

const itemRows = (items: readonly SeedItem[]): Row[] =>
  items.map(item => ({ file: itemFile(item), record: { ...item, origin: 'vanilla' } }));

export { checkRows, connectionRows, itemRows, screenRows };
export type { ConnectionContext, Row };

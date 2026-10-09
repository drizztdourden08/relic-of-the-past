/* @layer shared-game @kind logic */
import type { ConnectionNavData, RequirementSet, ConnectionPointData, TraversalRequirement, ConnectionTag } from '@rotp/game-data';
import type { BorderBundle } from './border-bundles';
import type { ConnectionNavUpdate, ConnectionUpdaterInput } from './connection-updater.type';
import { transitTypeFromTags } from './transit-type-from-tags';
import { BARRIER_TAG_PREFIX, REQUIREMENT_BY_BARRIER } from './connection-updater.constants';

const requirementsFromTags = (tags: readonly ConnectionTag[]): RequirementSet => {
  const reqs: string[] = [];
  for (const tag of tags) {
    if (!tag.startsWith(BARRIER_TAG_PREFIX) || tag === 'barrier:none') continue;
    const req = REQUIREMENT_BY_BARRIER[tag.slice(BARRIER_TAG_PREFIX.length)];
    if (req) reqs.push(req);
  }
  return reqs.length > 0 ? [reqs as TraversalRequirement[]] : [];
};

const bundleToConnectionPoint = (bundle: BorderBundle): ConnectionPointData => ({
  id: bundle.id,
  direction: bundle.direction,
  tiles: bundle.tiles,
  requirements: bundle.requirements.map(r => typeof r === 'string' ? [r] : r) as RequirementSet,
  oneWay: null,
});

const buildConnectionNavUpdates = (input: ConnectionUpdaterInput): ConnectionNavUpdate[] => {
  const { connections, borderBundles, overlapByKey, screenIndexMap } = input;
  const updates: ConnectionNavUpdate[] = [];

  for (const conn of connections) {
    const transitType = transitTypeFromTags(conn.tags);
    const requirements = requirementsFromTags(conn.tags);

    let fromPoint: ConnectionPointData | undefined;
    let overlapTiles: number[] | undefined;

    if (transitType === 'walk') {
      overlapTiles = overlapByKey.get(`${conn.from}|${conn.to}`);
      const fromScreen = screenIndexMap.get(conn.from);
      const bundles = fromScreen !== undefined ? borderBundles.get(fromScreen) : undefined;
      if (bundles?.length) fromPoint = bundleToConnectionPoint(bundles[0]);
    }

    const weight = transitType === 'walk' ? (overlapTiles?.length ?? 1) : 1;
    const nav: ConnectionNavData = { transitType, requirements, fromPoint, overlapTiles, weight };
    if (transitType === 'walk' && overlapTiles && overlapTiles.length === 0) nav.invalid = true;

    updates.push({ from: conn.from, to: conn.to, nav });
  }

  return updates;
};

export { buildConnectionNavUpdates };
export type { ConnectionNavUpdate, ConnectionUpdaterInput } from './connection-updater.type';

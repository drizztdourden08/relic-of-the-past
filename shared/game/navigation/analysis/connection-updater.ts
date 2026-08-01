/* @layer shared-game @kind logic */
/**
 * Connection Updater — Writes computed ConnectionNavData back into connections.
 *
 * After analysis completes, this module takes border overlap data + entrance
 * resolver output and produces ConnectionNavData for each connection.
 *
 * Design: Produces a JSON blob matching existing connection IDs.
 */

import type { ConnectionNavData, ConnectionTransitType, RequirementSet, ConnectionPointData, TraversalRequirement } from '../nav-data.types';
import type { ConnectionTag } from '../../data';
import type { ScreenConnection } from '../../types';
import type { ResolvedEntrance } from './entrance-resolver';
import type { BorderBundle } from './border-bundles';

interface ConnectionNavUpdate {
  from: string;
  to: string;
  nav: ConnectionNavData;
}

const transitTypeFromTags = (tags: readonly ConnectionTag[]): ConnectionTransitType => {
  for (const tag of tags) {
    if (tag.startsWith('transit:')) {
      const t = tag.slice(8);
      const mapping: Record<string, ConnectionTransitType> = {
        door: 'door',
        hole: 'hole',
        ledge: 'ledge',
        stairs: 'staircase',
        warp: 'warp_tile',
        mirror: 'mirror',
        walk: 'walk',
        swim: 'walk',
        waterfall: 'door',
        grave: 'door',
        bomb: 'door',
        bonk: 'door',
        rock: 'door',
        push: 'door',
        hookshot: 'walk',
      };
      return mapping[t] ?? 'door';
    }
  }
  return 'walk';
};

const requirementsFromTags = (tags: readonly ConnectionTag[]): RequirementSet => {
  const reqs: string[] = [];
  for (const tag of tags) {
    if (!tag.startsWith('barrier:') || tag === 'barrier:none') continue;
    const barrier = tag.slice(8);
    const mapping: Record<string, string> = {
      'gloves': 'lift.1',
      'hammer': 'hammer',
      'bomb': 'bombs',
      'dash': 'boots',
      'hookshot': 'hookshot',
      'swim': 'flippers',
      'fire': 'firerod',
      'book': 'book',
      'dark': 'lamp',
    };
    const req = mapping[barrier];
    if (req) reqs.push(req);
  }
  return reqs.length > 0 ? [reqs as TraversalRequirement[]] : [];
};

const isBidirectional = (tags: readonly ConnectionTag[]): boolean => {
  for (const tag of tags) {
    if (tag === 'dir:one-way') return false;
    if (tag === 'dir:two-way') return true;
  }
  // Default: walk connections are bidirectional, holes/ledges are not
  for (const tag of tags) {
    if (tag === 'transit:hole' || tag === 'transit:ledge') return false;
  }
  return true;
};

interface ConnectionUpdaterInput {
  connections: ScreenConnection[];
  /** Border bundles indexed by screen: Map<screenIndex, BorderBundle[]> */
  borderBundles: Map<number, BorderBundle[]>;
  /** Overlap tiles for walk connections: Map<"from|to", number[]> */
  overlapByKey: Map<string, number[]>;
  /** Resolved entrance points from entrance-resolver */
  resolvedEntrances: ResolvedEntrance[];
  /** Screen index lookup: Map<screenId, screenIndex> */
  screenIndexMap: Map<string, number>;
}

const buildConnectionNavUpdates = (input: ConnectionUpdaterInput): ConnectionNavUpdate[] => {
  const { connections, borderBundles, overlapByKey, resolvedEntrances, screenIndexMap } = input;
  const updates: ConnectionNavUpdate[] = [];

  // Index entrances by screen+id for fast lookup
  const entranceByKey = new Map<string, ResolvedEntrance>();
  for (const re of resolvedEntrances) {
    entranceByKey.set(`${re.screenIndex}:${re.entranceId}`, re);
  }

  for (const conn of connections) {
    const transitType = transitTypeFromTags(conn.tags);
    const requirements = requirementsFromTags(conn.tags);
    const bidirectional = isBidirectional(conn.tags);
    const connKey = `${conn.from}|${conn.to}`;

    let fromPoint: ConnectionPointData | undefined;
    let toPoint: ConnectionPointData | undefined;
    let overlapTiles: number[] | undefined;

    if (transitType === 'walk') {
      // Walk connections use border bundles and overlap
      overlapTiles = overlapByKey.get(connKey);
      const fromScreen = screenIndexMap.get(conn.from);
      const toScreen = screenIndexMap.get(conn.to);

      if (fromScreen !== undefined) {
        const bundles = borderBundles.get(fromScreen);
        if (bundles?.length) {
          // Find the bundle that best matches the overlap tiles
          fromPoint = bundleToConnectionPoint(bundles[0]);
        }
      }
      if (toScreen !== undefined) {
        const bundles = borderBundles.get(toScreen);
        if (bundles?.length) {
          toPoint = bundleToConnectionPoint(bundles[0]);
        }
      }
    }

    // Weight: 1 for instant transitions, overlap count for walks
    const weight = transitType === 'walk'
      ? (overlapTiles?.length ?? 1)
      : 1;

    const nav: ConnectionNavData = {
      transitType,
      requirements,
      bidirectional,
      fromPoint,
      toPoint,
      overlapTiles,
      weight,
    };

    // Flag invalid if walk connection has zero overlap
    if (transitType === 'walk' && overlapTiles && overlapTiles.length === 0) {
      nav.invalid = true;
    }

    updates.push({ from: conn.from, to: conn.to, nav });
  }

  return updates;
};

const bundleToConnectionPoint = (bundle: BorderBundle): ConnectionPointData => {
  return {
    id: bundle.id,
    direction: bundle.direction,
    tiles: bundle.tiles,
    requirements: bundle.requirements.map(r => typeof r === 'string' ? [r] : r) as RequirementSet,
    oneWay: null,
  };
};

export { transitTypeFromTags, isBidirectional, buildConnectionNavUpdates };
export type { ConnectionNavUpdate, ConnectionUpdaterInput };

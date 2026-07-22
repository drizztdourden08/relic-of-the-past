/* @layer renderer-widgets @kind hook */
/**
 * Connection audit — cross-checks the static ALL_CONNECTIONS dataset for the
 * current screen against the game's REAL in-game transitions.
 *
 *  • REVERSE audit → `remove` findings: an existing edge whose source is this
 *    screen but which NO real transition backs (suspicious / unbacked).
 *  • FORWARD detection → `add` findings: a real transition the dataset lacks.
 *
 * Conservative by design: only edges where `from === screenId` are audited, and
 * only when real game data for this screen is actually available.
 */

import { useMemo } from 'react';
import { ALL_CONNECTIONS } from '@shared/game/data/connections';
import { SCREEN_BY_ID, getScreenLookup } from '@shared/game/data/screens';
import { serializeConnection } from '@shared/game/data/screen-codegen';
import { buildConnectionNav } from '@shared/game/navigation/analysis/connection-nav-from-flood';
import type { ConnectionInfo } from '@shared/game/navigation';
import type { DetectedConnection } from './useDatasetStatus';
import type { ConnectionSuggestion, RealTransition } from './connection-audit-types';
import { resolveRealDestId, resolveConnectionTargetFile, inferTagsForDetected, screenDestIndex } from './connection-audit-resolve';
import { findFloodForTarget } from './connection-tile-display';

interface ConnectionAuditParams {
  screenId: string | null;
  /** Detected-but-unmapped transitions from useConnectionStatus. */
  unmatched: DetectedConnection[];
  /** Every real in-game transition observed for this screen. */
  realTransitions: RealTransition[];
  /** Whether real game data for this screen is trustworthy (room loaded / flood ran). */
  realAvailable: boolean;
  /** Live flood crossings — source of tile data attached to ADD suggestions. */
  floodConnections: ConnectionInfo[];
}

interface ConnectionAuditResult {
  badFindings: ConnectionSuggestion[];
  addFindings: ConnectionSuggestion[];
}

// Cap on how many real destinations get named in a bad-finding reason.
const MAX_REAL_DEST_NAMES = 5;

const buildBadFindings = (screenId: string, realTransitions: RealTransition[]): ConnectionSuggestion[] => {
  const lookup = getScreenLookup();
  // Real destinations, kept as raw game indices (not resolved screen ids) so a
  // room/screen index backs ALL screen variants that share it — a single
  // resolved id would only match whichever variant a first-match lookup picks.
  const realRoomIndices = new Set<number>();
  const realScreenIndices = new Set<number>();
  // Fallback set for the (rare) `conn.to` that has no roomIndex of its own.
  const realDestIds = new Set<string>();
  for (const t of realTransitions) {
    if (t.kind === 'room') realRoomIndices.add(t.index);
    else if (t.kind === 'screen') realScreenIndices.add(t.index);
    else if (t.kind === 'entrance') {
      const roomIndex = lookup.byEntranceId.get(t.index)?.roomIndex;
      if (roomIndex != null) realRoomIndices.add(roomIndex);
    }
    const id = resolveRealDestId(t.kind, t.index);
    if (id) realDestIds.add(id);
  }
  // Guard: without any resolvable real destination we cannot judge — stay silent.
  if (realRoomIndices.size === 0 && realScreenIndices.size === 0) return [];

  // Name the real destinations this screen DOES reach, so a wrong tag/target
  // (a hole/door that exists but goes elsewhere) points at the correct fix
  // instead of just reading as "no such transit exists at all". Same set for
  // every finding below — it depends only on screenId, not on conn.
  const realDests = [...realDestIds].slice(0, MAX_REAL_DEST_NAMES);
  const realDestsSuffix = realDests.length > 0
    ? ` — in-game transitions from ${screenId} go to: ${realDests.join(', ')}.`
    : '';

  const findings: ConnectionSuggestion[] = [];
  for (const conn of ALL_CONNECTIONS) {
    if (conn.from !== screenId) continue;
    if (conn.to === screenId) continue;

    const { room, screen } = screenDestIndex(conn.to);
    const backed = room != null ? realRoomIndices.has(room)
      : screen != null ? realScreenIndices.has(screen)
      : realDestIds.has(conn.to);
    if (backed) continue;

    const transit = conn.tags.find(t => t.startsWith('transit:'));
    const mech = transit ? transit.slice('transit:'.length) : null;
    // The flood only covers tiles reachable from Link's current position, so a
    // border it did not reach is NOT proof a walkable edge is absent — an
    // incomplete negative. Walk/ledge edges therefore only ever produce ADD
    // findings, never REMOVE. Door/stairs/hole/passage/warp/mirror edges are
    // authoritatively enumerable from the game tables and stay audited.
    if (mech === 'walk' || mech === 'ledge') continue;
    const reason = `No in-game transition from ${screenId} reaches ${conn.to}`
      + (mech ? `; tagged ${transit} but the room has no such ${mech}.` : '.')
      + realDestsSuffix;

    findings.push({
      kind: 'remove',
      from: conn.from,
      to: conn.to,
      tags: [...conn.tags],
      code: serializeConnection({ from: conn.from, to: conn.to, tags: conn.tags }),
      reason,
      targetFile: resolveConnectionTargetFile(conn.from, conn.to),
    });
  }
  return findings;
};

const KIND_TO_REALKIND = { entrance: 'screen', stair: 'room', edge: 'screen', hole: 'room' } as const;

// Grammatical article for each detection kind, so the reason reads naturally
// ("an entrance", "a stair", "an edge", "a hole").
const ARTICLE_FOR_TYPE: Record<DetectedConnection['type'], 'a' | 'an'> = {
  entrance: 'an',
  stair: 'a',
  edge: 'an',
  hole: 'a',
};

// The exit-screen detection reuses the 'entrance' type but prefixes its label
// with "Exit → "; strip that when a resolved screen name isn't available.
const destinationName = (to: string, det: DetectedConnection): string =>
  SCREEN_BY_ID.get(to)?.name ?? det.label.replace(/^Exit → /, '');

// Two independent detectors (the entrance scan and the exit-screen check) can
// both flag the same missing edge from the same screen. Dedupe on the
// resolved from/to pair plus the primary transit tag so a shared destination
// yields exactly one suggestion, keeping the first (and cleanest) label.
const buildAddFindings = (screenId: string, unmatched: DetectedConnection[], floodConnections: ConnectionInfo[]): ConnectionSuggestion[] => {
  const seen = new Set<string>();
  const findings: ConnectionSuggestion[] = [];

  for (const det of unmatched) {
    const resolved = resolveRealDestId(KIND_TO_REALKIND[det.type], det.targetRoomOrScreen);
    const to = resolved ?? (det.type === 'stair' || det.type === 'hole'
      ? `room-0x${det.targetRoomOrScreen.toString(16)}`
      : `lw-${det.targetRoomOrScreen.toString(16).padStart(2, '0')}`);
    const tags = inferTagsForDetected(det);

    const dedupeKey = `${screenId}|${to}|${tags[0] ?? ''}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    // Attach tile data from the matching live flood crossing so the written
    // connection records WHERE it connects; omit when no crossing backs it.
    const info = findFloodForTarget(floodConnections, to);
    const nav = info ? buildConnectionNav(info, tags) : undefined;

    findings.push({
      kind: 'add' as const,
      from: screenId,
      to,
      tags,
      code: serializeConnection({ from: screenId, to, tags, nav }),
      reason: `Game exposes ${ARTICLE_FOR_TYPE[det.type]} ${det.type} to ${destinationName(to, det)} that the dataset does not map.`,
      targetFile: resolveConnectionTargetFile(screenId, to),
    });
  }

  return findings;
};

const useConnectionAudit = (params: ConnectionAuditParams): ConnectionAuditResult => {
  const { screenId, unmatched, realTransitions, realAvailable, floodConnections } = params;
  return useMemo(() => {
    if (!screenId || !realAvailable) return { badFindings: [], addFindings: [] };
    return {
      badFindings: buildBadFindings(screenId, realTransitions),
      addFindings: buildAddFindings(screenId, unmatched, floodConnections),
    };
  }, [screenId, realAvailable, realTransitions, unmatched, floodConnections]);
};

export { useConnectionAudit };
export type { ConnectionAuditResult, ConnectionAuditParams };

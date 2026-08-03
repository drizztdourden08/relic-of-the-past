/* @layer renderer-widgets @kind logic */
/**
 * The connection audit itself — cross-checks the static dataset for one screen
 * against the game's REAL in-game transitions. Lifted out of
 * `useConnectionAudit` unchanged so it runs without a React render and the
 * recommendation detectors can call the very same code the widget does.
 *
 *  • REVERSE audit → `remove` findings: an existing edge whose source is this
 *    screen but which NO real transition backs (suspicious / unbacked).
 *  • FORWARD detection → `add` findings: a real transition the dataset lacks.
 *
 * Conservative by design: only edges where `from === screenId` are audited, only
 * when real game data for this screen is available, and only when BOTH endpoints
 * resolve to real screen records. A detected transition whose destination has no
 * record produces no finding at all — an unresolved edge is never written.
 */

import { connectionTagKeysOf, find, getScreen } from '@shared/game/data';
import type { ScreenId } from '@shared/game/data';
import { getScreenLookup } from '@shared/game/logic/queries/detection';
import { serializeConnectionRecord } from '@shared/game/data/record-codegen';
import { connectionRecordFile } from '@shared/game/data/record-file-targets';
import { buildConnectionNav } from '@shared/game/navigation/analysis/connection-nav-from-flood';
import type { ConnectionInfo } from '@shared/game/navigation';
import type { DetectedConnection } from './detect-connections';
import type { ConnectionSuggestion, RealTransition } from './connection-audit-types';
import { resolveRealDestId, inferTagsForDetected, screenDestIndex } from './connection-audit-resolve';
import { buildConnectionRecord } from './build-connection-record';
import { findFloodForTarget } from './connection-tile-display';

/** Cap on how many real destinations get named in a bad-finding reason. */
const MAX_REAL_DEST_NAMES = 5;

const screenLabel = (id: ScreenId): string => {
  const screen = getScreen(id);
  return screen.vanillaName ?? screen.randomizerName;
};

const buildBadFindings = (screenId: ScreenId, realTransitions: readonly RealTransition[]): ConnectionSuggestion[] => {
  const lookup = getScreenLookup();
  // Real destinations, kept as raw game indices (not resolved screen ids) so a
  // room/screen index backs ALL screen variants that share it — a single
  // resolved id would only match whichever variant a first-match lookup picks.
  const realRoomIndices = new Set<number>();
  const realScreenIndices = new Set<number>();
  // Fallback set for the (rare) `to` endpoint that has no roomIndex of its own.
  const realDestIds = new Set<ScreenId>();
  for (const t of realTransitions) {
    if (t.kind === 'room') realRoomIndices.add(t.index);
    else if (t.kind === 'screen') realScreenIndices.add(t.index);
    else if (t.kind === 'entrance') {
      const roomIndex = lookup.byEntranceId.get(t.index)?.gameId.roomIndex;
      if (roomIndex != null) realRoomIndices.add(roomIndex);
    }
    const id = resolveRealDestId(t.kind, t.index);
    if (id) realDestIds.add(id);
  }
  // Guard: without any resolvable real destination we cannot judge — stay silent.
  if (realRoomIndices.size === 0 && realScreenIndices.size === 0) return [];

  // Name the real destinations this screen DOES reach, so a wrong tag/target
  // (a hole/door that exists but goes elsewhere) points at the correct fix
  // instead of just reading as "no such transit exists at all".
  const realDests = [...realDestIds].slice(0, MAX_REAL_DEST_NAMES).map(id => `${screenLabel(id)} (${id})`);
  const realDestsSuffix = realDests.length > 0
    ? ` — in-game transitions from ${screenId} go to: ${realDests.join(', ')}.`
    : '';

  const findings: ConnectionSuggestion[] = [];
  for (const conn of find('connection', c => c.fromScreenId === screenId)) {
    if (conn.toScreenId === screenId) continue;

    const { room, screen } = screenDestIndex(conn.toScreenId);
    const backed = room != null ? realRoomIndices.has(room)
      : screen != null ? realScreenIndices.has(screen)
      : realDestIds.has(conn.toScreenId);
    if (backed) continue;

    // The flood only covers tiles reachable from the player's current position, so a
    // border it did not reach is NOT proof a walkable edge is absent — an
    // incomplete negative. Scroll crossings therefore only ever produce ADD
    // findings, never REMOVE. Door/stairs/hole/teleport/entrance crossings are
    // authoritatively enumerable from the game tables and stay audited.
    if (conn.kind === 'edge') continue;
    const targetFile = connectionRecordFile(conn.fromScreenId, conn.toScreenId);
    const reason = `No in-game transition from ${screenId} reaches ${conn.toScreenId}`
      + `; recorded as a ${conn.kind} but the room has no such crossing.`
      + realDestsSuffix;

    findings.push({
      kind: 'remove',
      fromScreenId: conn.fromScreenId,
      toScreenId: conn.toScreenId,
      tags: [...connectionTagKeysOf(conn.tags)],
      code: serializeConnectionRecord(conn),
      record: conn,
      reason,
      targetFile,
      write: targetFile.relativePath
        ? { mode: 'remove', filePath: targetFile.relativePath, connectionId: conn.id }
        : null,
    });
  }
  return findings;
};

/** Grammatical article per detection kind, so the reason reads naturally. */
const ARTICLE_FOR_TYPE: Record<DetectedConnection['type'], 'a' | 'an'> = {
  entrance: 'an', stair: 'a', edge: 'an', hole: 'a',
};

/**
 * Two independent detectors (the entrance scan and the exit-screen check) can
 * both flag the same missing edge from the same screen. Dedupe on the resolved
 * from/to pair plus the primary tag so a shared destination yields exactly one
 * suggestion, keeping the first (and cleanest) label.
 */
const buildAddFindings = (screenId: ScreenId, unmatched: readonly DetectedConnection[], floodConnections: readonly ConnectionInfo[]): ConnectionSuggestion[] => {
  const seen = new Set<string>();
  const findings: ConnectionSuggestion[] = [];

  for (const det of unmatched) {
    const to = det.toScreenId;
    // No record for the destination — there is nothing safe to write, so say
    // nothing rather than inventing an endpoint id.
    if (!to) continue;
    const tags = inferTagsForDetected(det);

    const dedupeKey = `${screenId}|${to}|${tags[0] ?? ''}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    // Attach tile data from the matching live flood crossing so the written
    // connection records WHERE it connects; omit when no crossing backs it.
    const info = findFloodForTarget([...floodConnections], to);
    const nav = info ? buildConnectionNav(info, tags) : undefined;
    const record = buildConnectionRecord({ fromScreenId: screenId, toScreenId: to, tags, nav });
    if (!record) continue;
    const targetFile = connectionRecordFile(screenId, to);

    findings.push({
      kind: 'add',
      fromScreenId: screenId,
      toScreenId: to,
      tags,
      code: serializeConnectionRecord(record),
      record,
      reason: `Game exposes ${ARTICLE_FOR_TYPE[det.type]} ${det.type} to ${screenLabel(to)} that the dataset does not map.`,
      targetFile,
      write: targetFile.relativePath
        ? { mode: 'insert', filePath: targetFile.relativePath, records: [record] }
        : null,
    });
  }

  return findings;
};

export { buildAddFindings, buildBadFindings, screenLabel };

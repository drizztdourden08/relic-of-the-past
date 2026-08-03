/* @layer shared-game @kind logic */
/**
 * What the loaded room's own chest table says is collectable here, against what
 * the check collection claims.
 *
 *  - `create` — the room draws a chest whose `{roomId, chestIndex}` no
 *    `CheckRecord.gameId` covers. `randomizerName` has no native answer, so this
 *    proposes an unmistakable placeholder rather than a guessed real name, the
 *    same call `item-grants` makes for an uncatalogued item. `vanillaItemIds`
 *    DOES have one: the chest's static contents byte lives in the same raw id
 *    space as `ItemGameId.receiveItemId`, so it resolves to a real item when the
 *    catalogue has it and stays empty when it does not.
 *
 *  - `update` — a record exists but disagrees with the room about something the
 *    room proves: its `kind` is not `chest` though a chest object draws it, or
 *    its `screenId` points at a screen belonging to a DIFFERENT room.
 *
 * Confidence is `certain` throughout: the chest table is enumerable for the
 * room and needs nothing to have happened first — no chest has to be opened for
 * it to report one — so an absence in the dataset is proven, not inferred. That
 * is the same standing the stair/exit/door tables have, and it is why this can
 * find a gap while the player merely stands in the room, where every
 * event-sourced observation stays silent.
 *
 * The screen comparison deliberately goes through the RECORDED screen's own
 * `roomIndex` rather than comparing screen ids: one room legitimately carries
 * several screen records (a progress variant of the same interior), so a check
 * attached to the variant this pass did not resolve is correct, not wrong. Only
 * a recorded screen that belongs to another room entirely is a real mismatch.
 * Chest CONTENTS are likewise left alone here — the check collection's
 * `vanillaItemIds` is edited per dungeon-specific reward in ways the raw byte
 * cannot adjudicate; the item side of a chest is `item-grants`' business.
 */
import { getCheckByGameId, getDungeonByGameId, getItemByGameId, getScreen } from '../../data';
import type { CheckRecord, ScreenId } from '../../data';
import type { ChestObservation, DetectionContext, RecommendationDetector } from '../detection-types';
import type { DraftRecommendation, Evidence } from '../types';

const DETECTOR_ID = 'check-presence';

const SOURCE = 'native:room-chests';

const hex = (n: number): string => `0x${n.toString(16).toUpperCase()}`;

const chestLabel = (chest: ChestObservation, roomId: number): string =>
  `${chest.isBig ? 'big chest' : 'chest'} ${chest.chestIndex} in room ${hex(roomId)} (contents ${hex(chest.itemId)})`;

/** The room this screen record belongs to, or null when nothing provable is on it. */
const roomOfScreen = (screenId: ScreenId | undefined): number | null => {
  if (!screenId) return null;
  return getScreen(screenId).gameId.roomIndex ?? null;
};

const createDraft = (chest: ChestObservation, roomId: number, context: DetectionContext): DraftRecommendation<'check'> => {
  const palaceIndex = context.observations.liveGameId?.palaceIndex;
  const dungeon = palaceIndex == null ? undefined : getDungeonByGameId({ palaceIndex });
  const content = getItemByGameId({ receiveItemId: chest.itemId });
  return {
    kind: 'check',
    action: 'create',
    targetId: null,
    current: null,
    proposed: {
      gameId: { roomId, chestIndex: chest.chestIndex },
      // Proven by the object the room draws — a chest object is what this is.
      kind: 'chest',
      screenId: context.screenId as ScreenId,
      ...(dungeon ? { dungeonId: dungeon.id } : {}),
      // No native answer: an obvious placeholder a reviewer must replace.
      randomizerName: `Unnamed chest ${hex(roomId)}#${chest.chestIndex}`,
      // The contents byte is a raw receive id: a real item when the catalogue
      // covers it, empty rather than invented when it does not.
      vanillaItemIds: content ? [content.id] : [],
    },
    reason: `The room draws a ${chestLabel(chest, roomId)}, which no CheckRecord's gameId covers.`,
    detector: DETECTOR_ID,
    evidence: [{ source: SOURCE, detail: `${chestLabel(chest, roomId)} has no catalogued check` }],
    confidence: 'certain',
    screenId: context.screenId,
    origin: context.origin,
    // A room can draw several uncatalogued chests at once, and a `create` has no
    // target id to tell them apart — the chest's own slot is what does.
    key: `chest:${roomId}:${chest.chestIndex}`,
  };
};

/** Every field the room proves wrong on an existing record, gathered into one finding. */
const correctionsFor = (current: CheckRecord, roomId: number, context: DetectionContext) => {
  const fixes: Partial<CheckRecord> = {};
  const evidence: Evidence[] = [];
  const reasons: string[] = [];

  if (current.kind !== 'chest') {
    fixes.kind = 'chest';
    reasons.push(`is catalogued as '${current.kind}' though a chest object draws it`);
    evidence.push({ source: SOURCE, detail: `chest slot ${current.gameId.chestIndex} draws in room ${hex(roomId)}` });
  }

  const recordedRoom = roomOfScreen(current.screenId);
  if (context.screenId && recordedRoom !== null && recordedRoom !== roomId) {
    fixes.screenId = context.screenId;
    reasons.push(`points at a screen belonging to room ${hex(recordedRoom)}`);
    evidence.push({ source: SOURCE, detail: `chest reported by room ${hex(roomId)}, record's screen is room ${hex(recordedRoom)}` });
  }

  return { fixes, evidence, reasons };
};

const updateDraft = (current: CheckRecord, roomId: number, context: DetectionContext): DraftRecommendation<'check'> | null => {
  const { fixes, evidence, reasons } = correctionsFor(current, roomId, context);
  if (reasons.length === 0) return null;

  return {
    kind: 'check',
    action: 'update',
    targetId: current.id,
    current,
    proposed: { ...current, ...fixes },
    reason: `${current.randomizerName} ${reasons.join(' and ')}.`,
    detector: DETECTOR_ID,
    evidence,
    confidence: 'certain',
    screenId: context.screenId,
    origin: context.origin,
  };
};

const checkPresenceDetector: RecommendationDetector = {
  id: DETECTOR_ID,
  kinds: ['check'],
  detect: (context: DetectionContext) => {
    const { chests, isIndoors, liveGameId } = context.observations;
    // Absent means "not read" — an unread chest table proves nothing, and
    // outdoors there is no chest table to read in the first place.
    if (!chests || !isIndoors) return [];
    const roomId = liveGameId?.roomIndex;
    if (roomId == null || !context.screenId) return [];

    const drafts: DraftRecommendation<'check'>[] = [];
    for (const chest of chests) {
      const current = getCheckByGameId({ roomId, chestIndex: chest.chestIndex });
      if (!current) {
        drafts.push(createDraft(chest, roomId, context));
        continue;
      }
      const update = updateDraft(current, roomId, context);
      if (update) drafts.push(update);
    }
    return drafts;
  },
};

export { checkPresenceDetector };

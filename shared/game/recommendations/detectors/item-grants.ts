/* @layer shared-game @kind logic */
/**
 * What the game says an item IS, from the two places it says so.
 *
 * The receive path only ever speaks about something that already happened, so
 * on its own this detector could not notice an uncatalogued chest reward until
 * the player opened the chest. The room's own chest table has no such
 * precondition — it reports each chest's static contents byte, in the same raw
 * id space, for merely being in the room — so an uncatalogued reward is found
 * by standing there. Both paths are evidence about the same raw id, so a screen
 * that produces both collapses to one finding, and the chest-sourced one wins:
 * the chest table is enumerable, a grant is a single occurrence.
 *
 * Findings about what the native receive path actually granted:
 *
 *  - `create` — a granted native id with no `ItemRecord` at all. The dataset's
 *    174-entry catalogue already covers the real item space, so this is a
 *    safety net rather than a common case. `category` and `randomizerName`
 *    have no native answer (unlike a screen's authoring gaps, `ItemRecord`
 *    requires both), so this proposes the dataset's own neutral defaults
 *    (`category: 'junk'`, an unmistakably-placeholder name) rather than
 *    guessing a real one — the same "don't invent, flag instead" call
 *    `getItemByGameId`'s facade neighbour makes for a missing record.
 *    `origin: 'vanilla'` IS provable, though: anything that reached
 *    `Link_ReceiveItem` is a real in-game item by definition.
 *
 *  - `update` — an existing record's `aliasOf` claims a duplicate-swap rule
 *    (`resolveDuplicate`) that the observed grant contradicts: the record's
 *    own raw id was granted verbatim while its OWN item was already owned, at
 *    which point `resolveDuplicate` says the swap should have applied. That is
 *    a genuinely checkable disagreement using only the record's own id and the
 *    observation's owned-set snapshot — not a guess about some other site.
 *
 * Confidence follows the evidence per finding, never a fixed default: a direct
 * native tally (`receiveCount` > 0, not from a delta) is enumerable and
 * `certain`; a tracker inventory delta only proves an item appeared, so it can
 * only ever be `likely`.
 */
import { getItem, getItemByGameId } from '../../data';
import type { ItemRecord } from '../../data';
import { resolveDuplicate } from '../../logic/queries/item-duplicates';
import type {
  ChestObservation, DetectionContext, GrantedItemObservation, RecommendationDetector,
} from '../detection-types';
import type { DraftRecommendation } from '../types';

const DETECTOR_ID = 'item-grants';

const hex = (n: number): string => `0x${n.toString(16).toUpperCase()}`;

/** The neutral placeholders a `create` proposes — see the file header. */
const placeholderFor = (itemId: number) => ({
  origin: 'vanilla' as const,
  category: 'junk' as const,
  randomizerName: `Unnamed item ${hex(itemId)}`,
  gameId: { receiveItemId: itemId },
});

const createDraft = (granted: GrantedItemObservation, context: DetectionContext): DraftRecommendation<'item'> => ({
  kind: 'item',
  action: 'create',
  targetId: null,
  current: null,
  // Proven `vanilla`: it came through the native receive path, so it is a real
  // in-game item. Name and category have no native answer — neutral
  // placeholders a reviewer must replace, never a guess.
  proposed: placeholderFor(granted.itemId),
  reason: `The game granted native item ${hex(granted.itemId)}, which no ItemRecord's gameId.receiveItemId covers.`,
  detector: DETECTOR_ID,
  evidence: [{
    source: granted.fromInventoryDelta ? 'tracker:inventory-delta' : 'native:receive-count',
    detail: `receive id ${hex(granted.itemId)} granted (count ${granted.receiveCount})`,
  }],
  confidence: granted.fromInventoryDelta ? 'likely' : 'certain',
  screenId: context.screenId,
  origin: context.origin,
  // A screen/session can grant several uncatalogued ids at once, and a
  // `create` has no target id to tell them apart — the native id is what does.
  key: `receiveItemId:${granted.itemId}`,
});

/**
 * The record's `aliasOf` rule disagrees with the observed grant: the record's
 * own item was already owned, `resolveDuplicate` says the raw id should have
 * swapped to the alias, but the raw id was granted anyway.
 */
const aliasMismatchDraft = (current: ItemRecord, granted: GrantedItemObservation, context: DetectionContext): DraftRecommendation<'item'> | null => {
  if (!current.aliasOf) return null;
  const primary = current.gameId?.receiveItemId;
  if (primary == null || granted.itemId !== primary || granted.receiveCount <= 0) return null;
  if (!granted.ownedItemIds.includes(current.id)) return null;

  const owned = new Set(granted.ownedItemIds);
  const expected = resolveDuplicate(primary, owned);
  if (expected === primary) return null;

  const alias = getItem(current.aliasOf);
  return {
    kind: 'item',
    action: 'update',
    targetId: current.id,
    current,
    proposed: { ...current, aliasOf: undefined },
    reason: `${current.randomizerName}'s aliasOf claims a swap to ${alias.randomizerName} once owned, but the game still `
      + `granted the raw id ${hex(primary)} while ${current.randomizerName} was already held.`,
    detector: DETECTOR_ID,
    evidence: [{
      source: granted.fromInventoryDelta ? 'tracker:inventory-delta' : 'native:receive-count',
      detail: `raw id ${hex(primary)} granted while ${current.id} already owned; resolveDuplicate expected ${hex(expected)}`,
    }],
    confidence: granted.fromInventoryDelta ? 'likely' : 'certain',
    screenId: context.screenId,
    origin: context.origin,
  };
};

/** A chest's static contents byte names an item the catalogue does not have. */
const chestDraft = (chest: ChestObservation, context: DetectionContext): DraftRecommendation<'item'> => ({
  kind: 'item',
  action: 'create',
  targetId: null,
  current: null,
  proposed: placeholderFor(chest.itemId),
  reason: `A chest in this room holds native item ${hex(chest.itemId)}, which no ItemRecord's gameId.receiveItemId covers.`,
  detector: DETECTOR_ID,
  evidence: [{
    source: 'native:room-chests',
    detail: `${chest.isBig ? 'big chest' : 'chest'} ${chest.chestIndex} holds raw id ${hex(chest.itemId)}`,
  }],
  // The room's chest table is enumerable and needs nothing to have happened.
  confidence: 'certain',
  screenId: context.screenId,
  origin: context.origin,
  key: `receiveItemId:${chest.itemId}`,
});

/** What `recommendationId` would distinguish these drafts by, minus the parts they share. */
const identityOf = (draft: DraftRecommendation<'item'>): string =>
  `${draft.action}|${draft.targetId ?? ''}|${draft.key ?? ''}`;

const itemGrantsDetector: RecommendationDetector = {
  id: DETECTOR_ID,
  kinds: ['item'],
  detect: (context: DetectionContext) => {
    const { chests, grantedItems } = context.observations;
    // Absent means "not read" on either source — an unread table proves nothing.
    const drafts = new Map<string, DraftRecommendation<'item'>>();
    const keep = (draft: DraftRecommendation<'item'>) => {
      const id = identityOf(draft);
      if (!drafts.has(id)) drafts.set(id, draft);
    };

    // Chests first, so the enumerable source wins a tie against a grant.
    for (const chest of chests ?? []) {
      if (getItemByGameId({ receiveItemId: chest.itemId })) continue;
      keep(chestDraft(chest, context));
    }

    for (const granted of grantedItems ?? []) {
      const record = getItemByGameId({ receiveItemId: granted.itemId });
      if (!record) {
        keep(createDraft(granted, context));
        continue;
      }
      const mismatch = aliasMismatchDraft(record, granted, context);
      if (mismatch) keep(mismatch);
    }
    return [...drafts.values()];
  },
};

export { itemGrantsDetector };

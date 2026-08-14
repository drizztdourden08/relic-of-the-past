/* @layer tests @kind test */
/**
 * `recordsFor` — the LiveDataInspector widget's join from (kind, live context)
 * to every record relating to the current screen, not just one. The bug this
 * replaces (`observations.existingConnections[0]`) only ever showed the FIRST
 * connection on a screen with several; these assertions are built around real
 * multi-record screens so a regression back to "just the first one" would
 * actually be caught.
 */
import { describe, it, expect } from 'vitest';
import {
  all, find, getActorByGameId, getDungeonByGameId, getItemByGameId, getScreen,
} from '@shared/game/data';
import { recordsFor } from '../../apps/web/src/ui/domains/widgets/navigation/LiveDataInspector/behavior/use-current-records';
import type { EntityKind } from '@shared/game/data';
import type { DetectionContext, LiveSpriteObservation } from '@shared/game/recommendations';
import { describeDataset } from '../dataset-guard';

const baseContext = (over: Partial<DetectionContext> = {}): DetectionContext => ({
  origin: 'live',
  screenId: null,
  observations: {
    match: null,
    liveGameId: { overworldIndex: 0, roomIndex: 0, palaceIndex: undefined, entranceId: undefined },
    isIndoors: false,
    realTransitions: [],
    realAvailable: false,
    unmatchedCrossings: [],
    floodConnections: [],
    existingConnections: [],
    palaceMismatches: [],
    ...over.observations,
  },
  ...over,
});

describeDataset('recordsFor — screen', () => {
  const screen = all('screen')[0];

  it('resolves the current screen\'s own record', () => {
    const ctx = baseContext({ screenId: screen.id });
    expect(recordsFor('screen', ctx)).toEqual([getScreen(screen.id)]);
  });

  it('resolves nothing with no screen', () => {
    expect(recordsFor('screen', baseContext())).toEqual([]);
  });
});

describeDataset('recordsFor — connection, EVERY edge touching this screen', () => {
  it('passes existingConnections through unchanged — no [0] truncation', () => {
    const connections = all('connection').slice(0, 3);
    expect(connections.length).toBeGreaterThanOrEqual(3);
    const ctx = baseContext({ observations: { existingConnections: connections } as never });
    expect(recordsFor('connection', ctx)).toBe(connections);
    expect(recordsFor('connection', ctx)).toHaveLength(3);
  });
});

describeDataset('recordsFor — check, every check that names this screen', () => {
  it('finds a real screen with several checks and returns all of them, none other', () => {
    const byScreen = new Map<string, number>();
    for (const check of all('check')) {
      if (!check.screenId) continue;
      byScreen.set(check.screenId, (byScreen.get(check.screenId) ?? 0) + 1);
    }
    const [screenId] = [...byScreen.entries()].find(([, count]) => count >= 2) ?? [];
    if (!screenId) throw new Error('no screen in the real dataset carries two or more checks');

    const ctx = baseContext({ screenId: screenId as never });
    const result = recordsFor('check', ctx);
    const expected = find('check', (check) => check.screenId === screenId);
    expect(result).toEqual(expected);
    expect(result.length).toBeGreaterThanOrEqual(2);
    for (const check of result) expect(check.screenId).toBe(screenId);
  });

  it('resolves nothing with no screen', () => {
    expect(recordsFor('check', baseContext())).toEqual([]);
  });
});

describeDataset('recordsFor — actor, one card per DISTINCT sprite type, not per spawn', () => {
  const actorsWithSpriteType = all('actor').filter((actor) => actor.gameId.spriteType != null);

  it('resolves every distinct sprite type spawned here, deduped', () => {
    const [first, second] = actorsWithSpriteType;
    if (!first || !second) throw new Error('need two real actors with a sprite type');

    const liveSprites: readonly LiveSpriteObservation[] = [
      { spriteType: first.gameId.spriteType!, col: 0, row: 0, floor: 0 },
      { spriteType: first.gameId.spriteType!, col: 1, row: 1, floor: 0 }, // a second spawn of the SAME type
      { spriteType: second.gameId.spriteType!, col: 2, row: 2, floor: 0 },
    ];
    const ctx = baseContext({ observations: { liveSprites } as never });

    const result = recordsFor('actor', ctx);
    expect(result).toEqual([
      getActorByGameId({ spriteType: first.gameId.spriteType }),
      getActorByGameId({ spriteType: second.gameId.spriteType }),
    ]);
  });

  it('resolves nothing with no live sprites', () => {
    expect(recordsFor('actor', baseContext())).toEqual([]);
  });
});

describeDataset('recordsFor — item, one card per DISTINCT granted item, not per grant', () => {
  const itemsWithReceiveId = all('item').filter((item) => item.gameId?.receiveItemId != null);

  it('resolves every distinct item granted this session, deduped', () => {
    const [first, second] = itemsWithReceiveId;
    if (!first || !second) throw new Error('need two real items with a receive id');

    const ctx = baseContext({
      observations: {
        grantedItems: [
          { itemId: first.gameId!.receiveItemId!, receiveCount: 1, ownedItemIds: [], fromInventoryDelta: false },
          { itemId: first.gameId!.receiveItemId!, receiveCount: 2, ownedItemIds: [], fromInventoryDelta: false },
          { itemId: second.gameId!.receiveItemId!, receiveCount: 1, ownedItemIds: [], fromInventoryDelta: false },
        ],
      } as never,
    });

    const result = recordsFor('item', ctx);
    expect(result).toEqual([
      getItemByGameId({ receiveItemId: first.gameId!.receiveItemId }),
      getItemByGameId({ receiveItemId: second.gameId!.receiveItemId }),
    ]);
  });
});

describeDataset('recordsFor — dungeon, the one currently loaded', () => {
  const dungeon = all('dungeon')[0];

  it('resolves the indoor palace by its live index', () => {
    const ctx = baseContext({
      observations: {
        isIndoors: true,
        liveGameId: { palaceIndex: dungeon.gameId.palaceIndex },
      } as never,
    });
    expect(recordsFor('dungeon', ctx)).toEqual([getDungeonByGameId({ palaceIndex: dungeon.gameId.palaceIndex })]);
  });

  it('resolves nothing outdoors, even with a palace index carried over', () => {
    const ctx = baseContext({
      observations: { isIndoors: false, liveGameId: { palaceIndex: dungeon.gameId.palaceIndex } } as never,
    });
    expect(recordsFor('dungeon', ctx)).toEqual([]);
  });
});

describeDataset('recordsFor — a kind with no direct live link', () => {
  it.each(['area', 'location', 'tag', 'item-group', 'enumeration'] satisfies EntityKind[])(
    'resolves nothing for %s rather than guessing',
    (kind) => {
      expect(recordsFor(kind, baseContext({ screenId: 'screen-1' as never }))).toEqual([]);
    },
  );
});

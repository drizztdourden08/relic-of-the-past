/* @layer tests @kind test */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FOREIGN_ITEM_KEY, FOREIGN_ITEM_NAME } from '@rotp/randomizer';
import { ITEM } from '@rotp/randomizer';
import { itemKeyName } from '@rotp/randomizer';
import { buildPlacementView } from '@rotp/randomizer';
import { currentRun } from '@app/game/randomizer-client/run-kind';
import { virtualCheckIdOf } from '@rotp/randomizer';
import {
  getSessionState, resetSession, startOnline, stopActive,
} from '@app/game/randomizer-client/session-store';
import type { ForeignOwners } from '@rotp/randomizer';
import type { OnlineSession } from '@app/game/randomizer-client/online-session';
import type { LocationKey } from '@rotp/randomizer';
import type { Placement } from '@rotp/randomizer';

type Status = OnlineSession['status'];

interface FakeOnline {
  session: OnlineSession;
  setStatus(status: Status): void;
  arm(placement: Placement, owners: ForeignOwners): void;
}

const online = vi.hoisted(() => ({ next: null as FakeOnline | null }));

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});
vi.mock('@app/game/randomizer-client/online-session', () => ({ createOnlineSession: () => online.next?.session }));
vi.mock('@app/game/randomizer-client/local-session', () => ({ createLocalSession: () => null }));

const createFakeOnline = (): FakeOnline => {
  let status: Status = 'idle';
  const statusListeners = new Set<(next: Status) => void>();
  const placementListeners = new Set<(placement: Placement, owners: ForeignOwners) => void>();
  const setStatus = (next: Status): void => {
    status = next;
    for (const listener of statusListeners) listener(next);
  };
  const session = {
    kind: 'online',
    get status() { return status; },
    start: async () => setStatus('active'),
    stop: () => setStatus('idle'),
    onStatusChange: (listener: (next: Status) => void) => {
      statusListeners.add(listener);
      return () => statusListeners.delete(listener);
    },
    onPlacement: (listener: (placement: Placement, owners: ForeignOwners) => void) => {
      placementListeners.add(listener);
      return () => placementListeners.delete(listener);
    },
    networkStatus: null,
    onNetworkStatus: () => () => undefined,
  } as unknown as OnlineSession;
  return {
    session,
    setStatus,
    arm: (placement, owners) => { for (const listener of placementListeners) listener(placement, owners); },
  };
};

const placementOf = (locations: Record<string, string>): Placement => ({
  seed: 'test', medallions: { mire: ITEM.ether, turtleRock: ITEM.quake }, locations, shopPrices: {}, pondDemands: {},
  spheres: [{ index: 1, locations: Object.keys(locations) }], stats: {},
}) as unknown as Placement;

const SCOUTED = placementOf({ 'check-001': FOREIGN_ITEM_KEY, 'check-002': FOREIGN_ITEM_KEY, 'check-003': ITEM.bow });
const OWNERS: ForeignOwners = { 'check-001': 'Zelda' };

const startArmed = async (): Promise<FakeOnline> => {
  const fake = createFakeOnline();
  online.next = fake;
  await startOnline({ url: 'ws://host:1', slotName: 'Link' }, 'manual');
  fake.arm(SCOUTED, OWNERS);
  return fake;
};

beforeEach(() => {
  resetSession();
});

describe('another player\'s item on display', () => {
  it('itemKeyName names it and never throws', () => {
    expect(itemKeyName(FOREIGN_ITEM_KEY)).toBe(FOREIGN_ITEM_NAME);
    expect(FOREIGN_ITEM_NAME).toBe('Another player\'s item');
  });

  it('the placement view shows it with the owner the scouts named, and never as a record', () => {
    const view = buildPlacementView(SCOUTED, OWNERS);
    expect(view.foreignByCheck.get('check-001')).toBe('Zelda\'s item');
    expect(view.foreignByCheck.get('check-002')).toBe(FOREIGN_ITEM_NAME);
    expect(view.itemByCheck.has('check-001')).toBe(false);
    expect(view.itemByCheck.get('check-003')).toBe(ITEM.bow);
    expect(view.unmatchedItems).toEqual([]);
  });

  it('a pond prize and a wish pond rung name the other player\'s item on their own rows', () => {
    const prize: LocationKey = 'slot-pond-capacity-1';
    const rung: LocationKey = 'slot-pond-wishing-3';
    const view = buildPlacementView(placementOf({ [prize]: FOREIGN_ITEM_KEY, [rung]: FOREIGN_ITEM_KEY }), { [prize]: 'Zelda' });
    expect(view.foreignByCheck.get(virtualCheckIdOf(prize))).toBe('Zelda\'s item');
    expect(view.foreignByCheck.get(virtualCheckIdOf(rung))).toBe(FOREIGN_ITEM_NAME);
    expect(view.unmatchedItems).toEqual([]);
  });

  it('the session store carries the owners with the scouted placement', async () => {
    await startArmed();
    expect(currentRun().kind).toBe('online');
    expect(getSessionState().placement).toBe(SCOUTED);
    expect(getSessionState().foreignOwners).toEqual(OWNERS);
  });
});

describe('a stopped online session', () => {
  it('drops its placement on stop, so the run reads as plain play and not a seed', async () => {
    await startArmed();
    stopActive();
    expect(getSessionState().placement).toBeNull();
    expect(getSessionState().foreignOwners).toEqual({});
    expect(currentRun().kind).toBe('normal');
  });

  it('drops it when the session winds down on its own', async () => {
    const fake = await startArmed();
    fake.setStatus('idle');
    expect(getSessionState().session).toBeNull();
    expect(getSessionState().placement).toBeNull();
    expect(currentRun().kind).toBe('normal');
  });

  it('an online session ended by an error is no run, whatever it left', async () => {
    const fake = await startArmed();
    fake.setStatus('error');
    expect(getSessionState().session).not.toBeNull();
    expect(getSessionState().placement).toBeNull();
    expect(currentRun().kind).toBe('normal');
  });
});

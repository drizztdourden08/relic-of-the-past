/* @layer tests @kind helper */
import type { FakeRoom } from '../ap-fake-server';
import { OWN } from '../ap-protocol-harness';

const recoveryRoom = (overrides: Partial<FakeRoom> = {}): FakeRoom => ({
  games: {
    [OWN]: { item_name_to_id: { Bow: 100, Hookshot: 101 }, location_name_to_id: { 'check-001': 1 }, checksum: 'own-1' },
  },
  items: [],
  checked: [],
  missing: [1],
  players: [{ team: 0, slot: 1, alias: 'Link', name: 'Link' }, { team: 0, slot: 2, alias: 'Zelda', name: 'Zelda' }],
  slotInfo: { 1: { name: 'Link', game: OWN, type: 1, group_members: [] } },
  slotData: { worldVersion: '0.1.0', options: {}, medallions: { mire: 'Ether', turtleRock: 'Quake' }, deathLink: false },
  placements: { 1: { item: 101, location: 1, player: 1, flags: 0 } },
  refusedUrls: new Set(),
  ...overrides,
});

export { recoveryRoom };

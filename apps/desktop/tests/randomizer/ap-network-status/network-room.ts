/* @layer tests @kind helper */
import type { FakeRoom } from '../ap-fake-server';
import { OWN, makeRoom } from '../ap-protocol-harness';

const networkRoom = (overrides: Partial<FakeRoom> = {}): FakeRoom => makeRoom({
  games: {
    [OWN]: { item_name_to_id: { Bow: 100, Hookshot: 101 }, location_name_to_id: { 'check-001': 1, 'check-002': 2 }, checksum: 'own-1' },
    Other: { item_name_to_id: { 'Other Sword': 500 }, location_name_to_id: { 'Other Place': 900 }, checksum: 'other-1' },
  },
  items: [{ item: 100, location: 900, player: 2, flags: 0 }],
  missing: [1, 2],
  slotData: { worldVersion: '0.1.0', options: {}, medallions: { mire: 'Ether', turtleRock: 'Quake' }, deathLink: false },
  placements: { 1: { item: 101, location: 1, player: 1, flags: 0 }, 2: { item: 500, location: 2, player: 2, flags: 0 } },
  seedName: 'SEED42',
  ...overrides,
});

export { networkRoom };

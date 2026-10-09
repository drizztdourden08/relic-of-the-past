/* @layer shared-game @kind logic */
import type { LocationKey } from '../../location-key.type';

const seedKey = {
  shopPrice: (slot: LocationKey): string => `shopPrice:${slot}`,
  pondPrice: (slot: LocationKey): string => `pondPrice:${slot}`,
  pondDemand: (rung: LocationKey): string => `pondDemand:${rung}`,
  pondGated: (rung: LocationKey): string => `pondGated:${rung}`,
} as const;

export { seedKey };

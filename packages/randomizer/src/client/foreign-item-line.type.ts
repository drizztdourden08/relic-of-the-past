/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../world/location-key';

interface ForeignItem {
  owner: string;
  item?: string;
  game?: string;
}

type ForeignItemOf = (location: LocationKey) => ForeignItem | undefined;

type ForeignOwners = Readonly<Partial<Record<LocationKey, string>>>;

export type { ForeignItem, ForeignItemOf, ForeignOwners };

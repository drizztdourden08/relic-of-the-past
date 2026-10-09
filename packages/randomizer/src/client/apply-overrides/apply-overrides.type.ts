/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../../world/location-key';

type MessageIdOf = (location: string) => number;

type ArmedShopEntry = { location: LocationKey; slotIndex: number; depthIndex: number };

type ArmedShopState = { entries: ArmedShopEntry[] };

export type { ArmedShopEntry, ArmedShopState, MessageIdOf };

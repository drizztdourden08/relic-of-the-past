/* @layer bridge-wasm @kind types */
import type { LocationKey } from '@shared/randomizer/world/location-key';

type ForeignIconIdOf = (location: LocationKey) => number | undefined;

export type { ForeignIconIdOf };

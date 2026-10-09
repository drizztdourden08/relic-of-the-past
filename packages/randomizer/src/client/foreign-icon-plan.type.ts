/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../world/location-key';

type ForeignIconIdOf = (location: LocationKey) => number | undefined;

export type { ForeignIconIdOf };

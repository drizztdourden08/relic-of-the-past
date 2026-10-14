/* @layer renderer-components @kind logic */
import { extentNumberOf } from './extent-number-of';
import type { Extent } from '@rotp/hud';

const numberOf = (value: Extent | undefined): number => extentNumberOf(value) ?? 0;

export { numberOf };

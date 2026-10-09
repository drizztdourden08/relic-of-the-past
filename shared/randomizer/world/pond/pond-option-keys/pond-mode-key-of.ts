/* @layer shared-game @kind logic */
import { pondKeyOf } from './pond-key-of';
import type { PondInstance } from '../pond-instance.type';

const pondModeKeyOf = (pond: PondInstance): string => pondKeyOf(pond, 'mode');

export { pondModeKeyOf };

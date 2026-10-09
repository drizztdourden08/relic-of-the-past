/* @layer shared-game @kind logic */
import { askKeyOf } from './ask-key-of';
import type { PondInstance } from '../pond-instance.type';

const pondAskItemKeyOf = (pond: PondInstance): string => askKeyOf(pond, 'item');

export { pondAskItemKeyOf };

/* @layer shared-game @kind logic */
import { askKeyOf } from './ask-key-of';
import type { PondInstance } from '../pond-instance.type';

const pondAskBottleKeyOf = (pond: PondInstance): string => askKeyOf(pond, 'bottle');

export { pondAskBottleKeyOf };

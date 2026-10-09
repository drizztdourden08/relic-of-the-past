/* @layer shared-game @kind logic */
import { askKeyOf } from './ask-key-of';
import type { PondAskAmountKind } from '../pond-ask.type';
import type { PondInstance } from '../pond-instance.type';

const pondAskMaxKeyOf = (pond: PondInstance, kind: PondAskAmountKind): string =>
  `${askKeyOf(pond, kind)}_max`;

export { pondAskMaxKeyOf };

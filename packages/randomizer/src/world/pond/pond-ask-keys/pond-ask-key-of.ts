/* @layer shared-game @kind logic */
import { askKeyOf } from './ask-key-of';
import type { PondAskCurrency } from '../pond-ask.type';
import type { PondInstance } from '../pond-instance.type';

const pondAskKeyOf = (pond: PondInstance, currency: PondAskCurrency): string => askKeyOf(pond, currency);

export { pondAskKeyOf };

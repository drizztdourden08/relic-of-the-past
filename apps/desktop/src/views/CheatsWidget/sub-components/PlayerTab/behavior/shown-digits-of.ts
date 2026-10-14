/* @layer renderer-widgets @kind logic */
import { WIDE_WALLET } from '../PlayerTab.constants';
import type { CounterKind } from '../PlayerTab.type';

const shownDigitsOf = (kind: CounterKind, digits: number, maxRupees: number): number =>
  (kind === 'rupees' && maxRupees > WIDE_WALLET ? digits + 1 : digits);

export { shownDigitsOf };

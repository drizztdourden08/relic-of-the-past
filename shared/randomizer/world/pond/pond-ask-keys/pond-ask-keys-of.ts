/* @layer shared-game @kind logic */
import { POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROWS } from '../pond-ask.data';
import { pondAskKeyOf } from './pond-ask-key-of';
import { pondAskMinKeyOf } from './pond-ask-min-key-of';
import { pondAskMaxKeyOf } from './pond-ask-max-key-of';
import { pondAskBottleKeyOf } from './pond-ask-bottle-key-of';
import { pondAskBottleContentKeyOf } from './pond-ask-bottle-content-key-of';
import { pondAskItemKeyOf } from './pond-ask-item-key-of';
import type { PondInstance } from '../pond-instance.type';

const pondAskKeysOf = (pond: PondInstance): readonly string[] => [
  ...POND_ASK_ROWS.flatMap((row) => [
    pondAskKeyOf(pond, row.currency), pondAskMinKeyOf(pond, row.currency), pondAskMaxKeyOf(pond, row.currency),
  ]),
  pondAskBottleKeyOf(pond),
  pondAskMinKeyOf(pond, 'bottle'),
  pondAskMaxKeyOf(pond, 'bottle'),
  ...POND_ASK_BOTTLE_CONTENTS.map(({ content }) => pondAskBottleContentKeyOf(pond, content)),
  pondAskItemKeyOf(pond),
];

export { pondAskKeysOf };

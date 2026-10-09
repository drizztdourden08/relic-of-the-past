/* @layer shared-game @kind logic */
import { POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROWS, POND_BOTTLE_ROW } from '../pond/pond-ask.data';
import {
  pondAskBottleContentKeyOf, pondAskBottleKeyOf, pondAskItemKeyOf, pondAskKeyOf,
} from '../pond/pond-ask-keys';
import { askToggleSeed } from './ask-toggle-seed';
import { askRangeSeedsOf } from './ask-range-seeds-of';
import type { PondInstance } from '../pond/pond-instance.type';
import type { OptionSeed, OptionValue, OptionValues } from '../options.type';

const pondAskSeedsOf = (pond: PondInstance, rows: OptionValues): OptionSeed[] => {
  const at = (key: string): OptionValue => rows[key];
  const counted = POND_ASK_ROWS.flatMap((row) => [
    askToggleSeed(pondAskKeyOf(pond, row.currency), `${pond.label} asks for ${row.label.toLowerCase()}`,
      at(pondAskKeyOf(pond, row.currency))),
    ...askRangeSeedsOf(pond, row, rows),
  ]);
  return [
    ...counted,
    askToggleSeed(pondAskBottleKeyOf(pond), `${pond.label} asks for a bottle`, at(pondAskBottleKeyOf(pond))),
    ...askRangeSeedsOf(pond, POND_BOTTLE_ROW, rows),
    ...POND_ASK_BOTTLE_CONTENTS.map(({ content, label }) => askToggleSeed(
      pondAskBottleContentKeyOf(pond, content), `${pond.label} may ask for ${label.toLowerCase()}`,
      at(pondAskBottleContentKeyOf(pond, content)))),
    askToggleSeed(pondAskItemKeyOf(pond), `${pond.label} asks to see an item`, at(pondAskItemKeyOf(pond))),
  ];
};

export { pondAskSeedsOf };

/* @layer shared-game @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { entryOf } from '../../checked-access';
import { POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROWS, POND_BOTTLE_ROW } from '../pond/pond-ask';
import {
  pondAskBottleContentKeyOf, pondAskBottleKeyOf, pondAskItemKeyOf, pondAskKeyOf,
} from '../pond/pond-ask-keys';
import { askToggleSeed } from './ask-toggle-seed';
import { askRangeSeedsOf } from './ask-range-seeds-of';
import type { PondInstance } from '../pond/pond-instance.type';
import type { OptionSeed, OptionValue, OptionValues } from '../options.type';

const pondAskSeedsOf = (pond: PondInstance, rows: OptionValues): OptionSeed[] => {
  const at = (key: string): OptionValue => entryOf(rows, key);
  const counted = POND_ASK_ROWS.flatMap((row) => [
    askToggleSeed(pondAskKeyOf(pond, row.currency), msg('randomizer-world:tpl.pond.askFor', { pond: pond.label, currency: row.currency }),
      at(pondAskKeyOf(pond, row.currency))),
    ...askRangeSeedsOf(pond, row, rows),
  ]);
  return [
    ...counted,
    askToggleSeed(pondAskBottleKeyOf(pond), msg('randomizer-world:tpl.pond.askBottle', { pond: pond.label }), at(pondAskBottleKeyOf(pond))),
    ...askRangeSeedsOf(pond, POND_BOTTLE_ROW, rows),
    ...POND_ASK_BOTTLE_CONTENTS.map(({ content }) => askToggleSeed(
      pondAskBottleContentKeyOf(pond, content), msg('randomizer-world:tpl.pond.askContent', { pond: pond.label, content }),
      at(pondAskBottleContentKeyOf(pond, content)))),
    askToggleSeed(pondAskItemKeyOf(pond), msg('randomizer-world:tpl.pond.askItem', { pond: pond.label }), at(pondAskItemKeyOf(pond))),
  ];
};

export { pondAskSeedsOf };

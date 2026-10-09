/* @layer shared-game @kind logic */
import { asksOnlyRupees } from '../pond-ask.data';
import { readPondAsk } from './read-pond-ask';
import type { PartialOptionValues } from '../../options.type';
import type { PondAskSetting } from '../pond-ask.type';
import type { PondInstance } from '../pond-instance.type';
import type { RupeeEnds } from '../pond.type';

const parsePondAsk = (
  values: PartialOptionValues, pond: PondInstance, ladder: RupeeEnds,
): PondAskSetting | undefined => {
  const ask = readPondAsk(values, pond, ladder);
  return asksOnlyRupees(ask) ? undefined : ask;
};

export { parsePondAsk };

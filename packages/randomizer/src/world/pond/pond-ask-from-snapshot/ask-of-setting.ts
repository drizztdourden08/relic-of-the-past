/* @layer shared-game @kind logic */
import { pondRupeesOnlyAsk } from '../pond-ask';
import type { PondAskSetting } from '../pond-ask.type';
import type { PondSetting } from '../pond-profile.type';

const askOfSetting = (setting: PondSetting): PondAskSetting => {
  if (setting.mode === 'capacity') return pondRupeesOnlyAsk(0, 0);
  const custom = setting.mode === 'custom' ? setting : undefined;
  const ladder = { min: custom?.start ?? 0, max: custom?.max ?? 0 };
  if (setting.ask === undefined) return pondRupeesOnlyAsk(ladder.min, ladder.max);
  return { ...setting.ask, rupees: { ...setting.ask.rupees, ...ladder } };
};

export { askOfSetting };

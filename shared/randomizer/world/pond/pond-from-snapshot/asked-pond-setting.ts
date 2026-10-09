/* @layer shared-game @kind logic */
import { optionNumberOf } from '../../capacity/option-number-of';
import { LEGACY_POND_SETTING, defaultPondSettingOf } from '../pond-profile-defaults';
import { POND_MODES } from '../pond-mode-switch';
import { pondKeyOf } from '../pond-option-keys';
import { pondAskMaxKeyOf, pondAskMinKeyOf } from '../pond-ask-keys';
import { parsePondAsk } from '../pond-ask-from-snapshot';
import { customOf } from './custom-of';
import { itemsOf } from './items-of';
import type { PartialOptionValues } from '../../options.type';
import type { PondAskSetting } from '../pond-ask.type';
import type { PondInstance } from '../pond-instance.type';
import type { PondMode } from '../pond-profile.type';
import type { ParsedPondSetting } from '../pond.type';

const fixedAskOf = (values: PartialOptionValues, pond: PondInstance): PondAskSetting | undefined => parsePondAsk(
  values, pond,
  {
    min: optionNumberOf(values[pondAskMinKeyOf(pond, 'rupees')]) || 0,
    max: optionNumberOf(values[pondAskMaxKeyOf(pond, 'rupees')]) || 0,
  },
);

const askedPondSetting = (values: PartialOptionValues, pond: PondInstance): ParsedPondSetting => {
  const raw = values[pondKeyOf(pond, 'mode')];
  if (raw === undefined) return { setting: defaultPondSettingOf(pond.id), notes: [] };
  const notes: string[] = [];
  const mode = POND_MODES.includes(raw as PondMode) ? raw as PondMode : 'capacity';
  if (mode !== raw) notes.push(`${pond.label}: unknown mode ${String(raw)}, using the vanilla pond`);
  if (mode === 'capacity') return { setting: LEGACY_POND_SETTING, notes };
  if (mode === 'custom') return { setting: customOf(values, pond, notes), notes };
  const ask = fixedAskOf(values, pond);
  return { setting: { mode, items: itemsOf(values, pond), ...(ask === undefined ? {} : { ask }) }, notes };
};

export { askedPondSetting };

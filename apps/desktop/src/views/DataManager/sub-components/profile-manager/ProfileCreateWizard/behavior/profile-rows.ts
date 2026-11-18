/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { languageLabel } from '../../../language-label';
import { shownLanguage } from '../../../shown-language';
import { presetOptions } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const profileRows = ({ name, rom, preset, language, msuPack }: ProfileWizardValues, t: I18n['t']): FactsPanelFact[] => [
  { label: t('wizards:profile.rows.name'), value: name.trim() },
  { label: t('wizards:profile.rows.rom'), value: rom, title: rom },
  { label: t('wizards:profile.rows.preset'), value: presetOptions(t).find((option) => option.value === preset)?.label ?? preset },
  { label: t('wizards:profile.rows.language'), value: languageLabel(shownLanguage(language), t) },
  { label: t('wizards:profile.rows.msu'), value: msuPack || t('wizards:profile.none') },
];

export { profileRows };

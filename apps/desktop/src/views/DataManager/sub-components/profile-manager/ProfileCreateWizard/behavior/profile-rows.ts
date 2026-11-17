/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { languageLabel } from '../../../language-label';
import { shownLanguage } from '../../../shown-language';
import { NO_MSU_LABEL, PRESET_OPTIONS } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const profileRows = ({ name, rom, preset, language, msuPack }: ProfileWizardValues): FactsPanelFact[] => [
  { label: 'Profile Name', value: name.trim() },
  { label: 'ROM', value: rom, title: rom },
  { label: 'Preset', value: PRESET_OPTIONS.find((option) => option.value === preset)?.label ?? preset },
  { label: 'Language', value: languageLabel(shownLanguage(language)) },
  { label: 'MSU Pack', value: msuPack || NO_MSU_LABEL },
];

export { profileRows };

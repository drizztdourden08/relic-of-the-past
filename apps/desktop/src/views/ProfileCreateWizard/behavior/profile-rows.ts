/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { DEFAULT_LANGUAGE_LABEL, NO_MSU_LABEL, PRESET_OPTIONS } from '../ProfileCreateWizard.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const profileRows = ({ name, rom, preset, language, msuPack }: ProfileWizardValues): FactsPanelFact[] => [
  { label: 'Profile Name', value: name.trim() },
  { label: 'ROM', value: rom, title: rom },
  { label: 'Preset', value: PRESET_OPTIONS.find((option) => option.value === preset)?.label ?? preset },
  { label: 'Language', value: language || DEFAULT_LANGUAGE_LABEL },
  { label: 'MSU Pack', value: msuPack || NO_MSU_LABEL },
];

export { profileRows };

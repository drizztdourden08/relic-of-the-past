/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { slugSetId } from '@rotp/languages';
import type { LanguageSetSummary } from '@rotp/languages';
import { RELEASE_ITEMS, SOURCE_LABELS } from '../LanguageCreateWizard.constants';
import type { LanguageWizardValues, TextOrFile } from '../LanguageCreateWizard.type';
import { setOptionLabel } from './set-option-label';

const releaseLabel = (release: string): string => RELEASE_ITEMS.find((item) => item.value === release)?.release ?? release;

const providedLabel = (field: TextOrFile): string => {
  if (field.text.trim() === '') return 'None';
  return field.mode === 'file' ? `File: ${field.fileName}` : 'Provided as text';
};

const nameRows = (name: string): FactsPanelFact[] => [
  { label: 'Name', value: name.trim() },
  { label: 'Set id', value: slugSetId(name), mono: true },
];

const romRows = (values: LanguageWizardValues): FactsPanelFact[] =>
  [{ label: 'ROM', value: values.romFile === null ? values.romUrl.trim() : values.romFile.name }];

const patchedRows = (values: LanguageWizardValues): FactsPanelFact[] => [
  ...nameRows(values.name),
  { label: 'Based on', value: releaseLabel(values.release) },
  { label: 'ROM file', value: values.patchedFile?.name ?? '' },
  { label: 'Licence', value: providedLabel(values.license) },
  { label: 'Notes / Credits', value: providedLabel(values.credits) },
];

const setRows = (values: LanguageWizardValues, sets: readonly LanguageSetSummary[]): FactsPanelFact[] => {
  const base = sets.find((set) => set.id === values.baseSet);
  return [
    ...nameRows(values.name),
    { label: values.source === 'copy' ? 'Copy of' : 'Based on', value: base === undefined ? values.baseSet : setOptionLabel(base) },
  ];
};

const sourceRows = (values: LanguageWizardValues, sets: readonly LanguageSetSummary[]): FactsPanelFact[] => {
  if (values.source === 'rom') return romRows(values);
  if (values.source === 'patched') return patchedRows(values);
  return setRows(values, sets);
};

const reviewRows = (values: LanguageWizardValues, sets: readonly LanguageSetSummary[]): FactsPanelFact[] => [
  { label: 'Source', value: SOURCE_LABELS[values.source] },
  ...sourceRows(values, sets),
];

export { reviewRows };

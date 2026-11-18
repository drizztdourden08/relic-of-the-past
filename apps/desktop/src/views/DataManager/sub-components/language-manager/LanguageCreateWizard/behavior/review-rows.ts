/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { slugSetId } from '@rotp/languages';
import type { LanguageSetSummary } from '@rotp/languages';
import { releaseItems, sourceLabels } from '../LanguageCreateWizard.constants';
import type { LanguageWizardValues, TextOrFile } from '../LanguageCreateWizard.type';
import { setOptionLabel } from './set-option-label';

const releaseLabel = (release: string, t: I18n['t']): string => releaseItems(t).find((item) => item.value === release)?.release ?? release;

const providedLabel = (field: TextOrFile, t: I18n['t']): string => {
  if (field.text.trim() === '') return t('wizards:language.review.none');
  return field.mode === 'file' ? t('wizards:language.review.file', { name: field.fileName }) : t('wizards:language.review.text');
};

const nameRows = (name: string, t: I18n['t']): FactsPanelFact[] => [
  { label: t('wizards:language.review.name'), value: name.trim() },
  { label: t('wizards:language.review.set-id'), value: slugSetId(name), mono: true },
];

const romRows = (values: LanguageWizardValues, t: I18n['t']): FactsPanelFact[] =>
  [{ label: t('wizards:language.review.rom'), value: values.romFile === null ? values.romUrl.trim() : values.romFile.name }];

const patchedRows = (values: LanguageWizardValues, t: I18n['t']): FactsPanelFact[] => [
  ...nameRows(values.name, t),
  { label: t('wizards:language.review.based-on'), value: releaseLabel(values.release, t) },
  { label: t('wizards:language.review.rom-file'), value: values.patchedFile?.name ?? '' },
  { label: t('wizards:language.review.licence'), value: providedLabel(values.license, t) },
  { label: t('wizards:language.review.credits'), value: providedLabel(values.credits, t) },
];

const setRows = (values: LanguageWizardValues, sets: readonly LanguageSetSummary[], t: I18n['t']): FactsPanelFact[] => {
  const base = sets.find((set) => set.id === values.baseSet);
  return [
    ...nameRows(values.name, t),
    { label: values.source === 'copy' ? t('wizards:language.review.copy-of') : t('wizards:language.review.based-on'), value: base === undefined ? values.baseSet : setOptionLabel(base) },
  ];
};

const sourceRows = (values: LanguageWizardValues, sets: readonly LanguageSetSummary[], t: I18n['t']): FactsPanelFact[] => {
  if (values.source === 'rom') return romRows(values, t);
  if (values.source === 'patched') return patchedRows(values, t);
  return setRows(values, sets, t);
};

const reviewRows = (values: LanguageWizardValues, sets: readonly LanguageSetSummary[], t: I18n['t']): FactsPanelFact[] => [
  { label: t('wizards:language.review.source'), value: sourceLabels(t)[values.source] },
  ...sourceRows(values, sets, t),
];

export { reviewRows };

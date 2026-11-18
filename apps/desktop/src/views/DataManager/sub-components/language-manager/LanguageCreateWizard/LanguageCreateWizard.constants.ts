/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { WizardStepButtons } from '@drizztdourden08/tessera/composites';
import { OFFICIAL_RELEASES, ZELDA3_SHA1 } from '@rotp/asset-extraction';
import type { RomLanguage } from '@rotp/asset-extraction';
import type { LanguageSource, LanguageWizardValues, ReleaseItem, TextOrFile } from './LanguageCreateWizard.type';

const STEP_IDS = {
  source: 'source',
  details: 'details',
  extract: 'extract',
  import: 'import',
  create: 'create',
} as const;

const stepLabels = (t: I18n['t']) => ({
  source: t('wizards:language.steps.source'),
  details: t('wizards:language.steps.details'),
  extract: t('wizards:language.steps.extract'),
  import: t('wizards:language.steps.import'),
  create: t('wizards:language.steps.create'),
}) as const;

const sourceLabels = (t: I18n['t']): Readonly<Record<LanguageSource, string>> => ({
  rom: t('wizards:language.source.rom'),
  patched: t('wizards:language.source.patched'),
  copy: t('wizards:language.source.copy'),
  blank: t('wizards:language.source.blank'),
});

const sourceDescriptions = (t: I18n['t']): Readonly<Record<LanguageSource, string>> => ({
  rom: t('wizards:language.source.rom-description'),
  patched: t('wizards:language.source.patched-description'),
  copy: t('wizards:language.source.copy-description'),
  blank: t('wizards:language.source.blank-description'),
});

const SOURCE_ORDER: readonly LanguageSource[] = ['rom', 'patched', 'copy', 'blank'];

const DEFAULT_RELEASE: RomLanguage = 'us';

const releaseName = (code: string, t: I18n['t']): string => {
  const names: Readonly<Record<string, string>> = {
    us: t('wizards:language.release.us'),
    de: t('wizards:language.release.de'),
    fr: t('wizards:language.release.fr'),
    'fr-c': t('wizards:language.release.fr-c'),
    en: t('wizards:language.release.en'),
  };
  return names[code] ?? code;
};

const releaseItem = (code: RomLanguage, t: I18n['t']): ReleaseItem => {
  const sha1 = Object.keys(ZELDA3_SHA1).find((hash) => ZELDA3_SHA1[hash]?.language === code) ?? '';
  return { value: code, release: releaseName(code, t), sha1 };
};

const releaseItems = (t: I18n['t']): readonly ReleaseItem[] => OFFICIAL_RELEASES.map((code) => releaseItem(code, t));

const EMPTY_TEXT_OR_FILE: TextOrFile = { mode: 'text', text: '', fileName: '' };

const textOrFileOptions = (t: I18n['t']) => [
  { value: 'text', label: t('wizards:language.text-or-file.text') },
  { value: 'file', label: t('wizards:language.text-or-file.file') },
] as const;

const LICENSE_ACCEPT = ['.txt', '.md', '.license'];

const PATCHED_ROM_ACCEPT = ['.sfc', '.smc', '.zip'];

const busyHints = (t: I18n['t']) => ({
  extract: t('wizards:language.busy.extract'),
  import: t('wizards:language.busy.import'),
  create: t('wizards:language.busy.create'),
}) as const;

const extractButtons = (t: I18n['t']): WizardStepButtons => ({ next: { label: t('wizards:language.buttons.extract') } });

const createButtons = (t: I18n['t']): WizardStepButtons => ({ next: { label: t('wizards:language.buttons.create') } });

const importButtons = (t: I18n['t']): WizardStepButtons => ({ next: { label: t('wizards:language.buttons.done') } });

const importedButtons = (t: I18n['t']): WizardStepButtons => ({ cancel: false, back: false, next: { label: t('wizards:language.buttons.done') } });

const problems = (t: I18n['t']) => ({
  noRom: t('wizards:language.problem.no-rom'),
  badUrl: t('wizards:language.problem.bad-url'),
  noName: t('wizards:language.problem.no-name'),
  noPatchedRom: t('wizards:language.problem.no-patched-rom'),
  noBase: t('wizards:language.problem.no-base'),
  notImported: t('wizards:language.problem.not-imported'),
}) as const;

const INITIAL_VALUES: LanguageWizardValues = {
  source: 'rom',
  romFile: null,
  romUrl: '',
  romCheck: null,
  patchedFile: null,
  patchedCheck: null,
  name: '',
  release: DEFAULT_RELEASE,
  credits: EMPTY_TEXT_OR_FILE,
  license: EMPTY_TEXT_OR_FILE,
  baseSet: '',
};

export {
  busyHints, createButtons, EMPTY_TEXT_OR_FILE, extractButtons, importedButtons, importButtons, INITIAL_VALUES,
  LICENSE_ACCEPT, PATCHED_ROM_ACCEPT, problems, releaseItems, sourceDescriptions, sourceLabels,
  SOURCE_ORDER, STEP_IDS, stepLabels, textOrFileOptions,
};

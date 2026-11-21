/* @layer renderer-components @kind logic */
import type { LanguageWizardValues } from '../LanguageCreateWizard.type';

const textOrNothing = (text: string): string | undefined => {
  const trimmed = text.trim();
  return trimmed === '' ? undefined : trimmed;
};

const detailsSummary = (values: LanguageWizardValues): string | undefined => {
  if (values.source !== 'rom') return textOrNothing(values.name);
  return values.romFile === null ? textOrNothing(values.romUrl) : values.romFile.name;
};

export { detailsSummary };

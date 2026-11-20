/* @layer shared-game @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { OPTION_DESCRIPTIONS } from '../options-descriptions.constants';
import type { OptionDescriptionSource, OptionDetail, OptionDetailSource } from '../option-description.type';
import type { OptionDef } from '../options.type';
import { exportOptionText } from './export-option-text';

const exportDetailsOf = (entry: OptionDescriptionSource): readonly OptionDetail[] | undefined =>
  (Array.isArray(entry)
    ? (entry as readonly OptionDetailSource[]).map(({ term, detail }) => ({ term: exportOptionText(term), detail: exportOptionText(detail) }))
    : undefined);

const exportDescriptionOf = (entry: OptionDescriptionSource): string => {
  const details = exportDetailsOf(entry);
  return details === undefined
    ? exportOptionText(entry as Text)
    : details.map(({ term, detail }) => `${term}: ${detail}`).join(' ');
};

const exportOptionOf = (option: OptionDef): Omit<OptionDef, 'displayName'> & { displayName: string } => {
  const entry = OPTION_DESCRIPTIONS[option.key];
  return {
    ...option,
    displayName: exportOptionText(option.displayName),
    description: entry === undefined ? '' : exportDescriptionOf(entry),
    details: entry === undefined ? undefined : exportDetailsOf(entry),
  };
};

export { exportOptionOf };

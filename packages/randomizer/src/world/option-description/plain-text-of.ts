/* @layer shared-game @kind logic */
import { optionText } from '../options/option-text';
import { detailsOf } from './details-of';
import type { OptionDescriptionSource } from '../option-description.type';
import type { Text } from '@drizztdourden08/brock-core/i18n';

const plainTextOf = (description: OptionDescriptionSource): string => {
  const details = detailsOf(description);
  return details === undefined
    ? optionText(description as Text)
    : details.map(({ term, detail }) => `${term}: ${detail}`).join(' ');
};

export { plainTextOf };

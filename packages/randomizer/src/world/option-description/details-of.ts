/* @layer shared-game @kind logic */
import { optionText } from '../options/option-text';
import type { OptionDescriptionSource, OptionDetail, OptionDetailSource } from '../option-description.type';

const detailsOf = (description: OptionDescriptionSource): readonly OptionDetail[] | undefined =>
  (Array.isArray(description)
    ? (description as readonly OptionDetailSource[])
      .map(({ term, detail }) => ({ term: optionText(term), detail: optionText(detail) }))
    : undefined);

export { detailsOf };

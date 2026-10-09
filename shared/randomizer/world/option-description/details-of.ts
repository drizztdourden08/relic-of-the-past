/* @layer shared-game @kind logic */
import type { OptionDescription, OptionDetail } from '../option-description.type';

const detailsOf = (description: OptionDescription): readonly OptionDetail[] | undefined =>
  (typeof description === 'string' ? undefined : description);

export { detailsOf };

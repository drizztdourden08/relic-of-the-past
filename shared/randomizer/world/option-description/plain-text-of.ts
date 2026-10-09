/* @layer shared-game @kind logic */
import type { OptionDescription } from '../option-description.type';

const plainTextOf = (description: OptionDescription): string =>
  (typeof description === 'string'
    ? description
    : description.map(({ term, detail }) => `${term}: ${detail}`).join(' '));

export { plainTextOf };

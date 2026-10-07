/* @layer store-site @kind logic */
/**
 * Numbers as the store shows them: counts grouped by thin spaces (`4 870`), a rating to one
 * decimal, and a count with its noun in the right number.
 */
const GROUP = /\B(?=(\d{3})+(?!\d))/g;

const formatCount = (n: number): string => String(Math.round(n)).replace(GROUP, ' ');

const formatAverage = (average: number | null): string => (average === null ? '-' : average.toFixed(1));

const plural = (n: number, one: string, many: string): string => `${formatCount(n)} ${n === 1 ? one : many}`;

/** The plain average of a sum over a count; null with no ratings. */
const averageOf = (sum: number, count: number): number | null => (count > 0 ? sum / count : null);

export { formatCount, formatAverage, plural, averageOf };

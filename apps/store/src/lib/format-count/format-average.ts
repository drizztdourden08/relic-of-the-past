/* @layer store-site @kind logic */
const formatAverage = (average: number | null): string => (average === null ? '-' : average.toFixed(1));

export { formatAverage };

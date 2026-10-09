/* @layer renderer-lib @kind logic */
const pluralStep = (count: number, unit: string): string => `+${count} ${unit}${count === 1 ? '' : 's'}`;

export { pluralStep };

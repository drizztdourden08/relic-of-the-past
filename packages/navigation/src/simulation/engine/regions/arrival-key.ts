/* @layer shared-game @kind logic */
const arrivalKey = (to: string, edgeSig?: string): string => `${to}#${edgeSig ?? 'x'}`;

export { arrivalKey };

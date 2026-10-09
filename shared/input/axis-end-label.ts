/* @layer shared-input @kind logic */
const axisEndLabel = (axisLabel: string, direction: '+' | '-'): string =>
  `${axisLabel} ${direction === '+' ? '+' : '−'}`;

export { axisEndLabel };

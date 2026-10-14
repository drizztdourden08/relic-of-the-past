/* @layer renderer-widgets @kind logic */
const floorRangeLabel = (above: number, basement: number): string => {
  const aboveLabel = above > 0 ? `${above}F` : '';
  const joiner = above > 0 && basement > 0 ? ' - ' : '';
  const basementLabel = basement > 0 ? `B${basement}` : '';
  return `[${aboveLabel}${joiner}${basementLabel}]`;
};

export { floorRangeLabel };

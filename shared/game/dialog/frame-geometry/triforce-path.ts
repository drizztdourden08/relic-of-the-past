/* @layer shared-game @kind logic */
const triforcePath = (s: number): string => {
  const half = s / 2;
  const w = s / Math.sqrt(3);
  const top = `M0 ${-half}L${w / 2} 0L${-w / 2} 0Z`;
  const left = `M${-w / 2} 0L0 ${half}L${-w} ${half}Z`;
  const right = `M${w / 2} 0L${w} ${half}L0 ${half}Z`;
  return `${top}${left}${right}`;
};

export { triforcePath };

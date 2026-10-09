/* @layer renderer-hud @kind logic */
const wrapX = (x: number, span: number, width: number): number => {
  const period = width + span;
  return ((x % period) + period) % period - span;
};

export { wrapX };

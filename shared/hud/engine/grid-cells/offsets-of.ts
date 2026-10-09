/* @layer shared-hud @kind logic */
const offsetsOf = (sizes: readonly number[], gap: number): number[] => {
  const out: number[] = [];
  let pen = 0;
  sizes.forEach((size) => {
    out.push(pen);
    pen += size + gap;
  });
  return out;
};

export { offsetsOf };

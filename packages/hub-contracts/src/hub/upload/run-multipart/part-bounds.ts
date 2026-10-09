/* @layer shared-hub @kind logic */
const partBounds = (part: number, partSize: number, size: number): [number, number] =>
  [(part - 1) * partSize, Math.min(part * partSize, size)];

export { partBounds };

/* @layer shared-hub @kind logic */
import { partBounds } from './part-bounds';

const partBytes = (part: number, partSize: number, size: number) => {
  const [start, end] = partBounds(part, partSize, size);
  return end - start;
};

export { partBytes };

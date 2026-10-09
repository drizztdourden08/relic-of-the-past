/* @layer shared-game @kind logic */
import { SEGMENT_PATTERN } from './record-path.constants';
import type { Segment } from './record-path.type';

const segmentsOf = (path: string): readonly Segment[] => {
  const out: Segment[] = [];
  for (const match of path.matchAll(SEGMENT_PATTERN)) {
    const index = match[1];
    out.push(index !== undefined ? { key: index, isIndex: true } : { key: match[0], isIndex: false });
  }
  return out;
};

export { segmentsOf };

/* @layer website-site @kind logic */
import { DENSE_MIN, SPARSE_MAX } from '../CloudStage.constants';
import type { CloudDensity } from '../CloudStage.type';

const densityOf = (count: number): CloudDensity => {
  if (count <= SPARSE_MAX) return 'sparse';
  return count >= DENSE_MIN ? 'dense' : 'normal';
};

export { densityOf };

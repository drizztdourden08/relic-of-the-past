/* @layer renderer-app @kind logic */
import type { ReferencedByHit } from '@drizztdourden08/tessera/composites';
import type { DeleteRoute } from '@app/views/DataInspector/DataInspector.type';

const routeDelete = (hits: readonly ReferencedByHit[]): DeleteRoute =>
  (hits.length === 0 ? { kind: 'immediate' } : { kind: 'confirm', hits });

export { routeDelete };

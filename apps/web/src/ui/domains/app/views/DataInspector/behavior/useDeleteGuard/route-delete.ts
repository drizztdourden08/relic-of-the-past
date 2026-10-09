/* @layer renderer-app @kind logic */
import type { ReferencedByHit } from '@ds/composites/RecordEditor';
import type { DeleteRoute } from '../../DataInspector.type';

const routeDelete = (hits: readonly ReferencedByHit[]): DeleteRoute =>
  (hits.length === 0 ? { kind: 'immediate' } : { kind: 'confirm', hits });

export { routeDelete };

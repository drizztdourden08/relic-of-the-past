/* @layer renderer-lib @kind logic */
import type { CapacityFamilyId } from '@rotp/randomizer';

const headroomOf = (id: CapacityFamilyId, fillerHeadroom: number | null, inPool: number, span: number): number =>
  id === 'wallet' && fillerHeadroom !== null ? inPool + fillerHeadroom : span;

export { headroomOf };

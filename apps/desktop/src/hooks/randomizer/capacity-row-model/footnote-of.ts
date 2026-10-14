/* @layer renderer-lib @kind logic */
import type { CapacityFamilyId, FamilySetting } from '@rotp/randomizer';
import type { CapacityRowModel } from '@app/compounds/CapacityFamilyRow';

const footnoteOf = (id: CapacityFamilyId, setting: FamilySetting): CapacityRowModel['footnote'] =>
  id === 'wallet' && setting.mode === 'custom' ? 'turns "Carry more rupees" on for this profile' : undefined;

export { footnoteOf };

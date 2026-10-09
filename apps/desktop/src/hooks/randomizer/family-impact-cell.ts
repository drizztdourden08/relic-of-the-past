/* @layer renderer-lib @kind logic */
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import { signedCount } from './signed-count';

const familyImpactCell = (spotIsCheck: boolean, upgrades: number): ImpactCell => ({
  text: `${signedCount(spotIsCheck ? 1 : 0)} loc · ${upgrades} upgrade${upgrades === 1 ? '' : 's'}`,
  muted: upgrades === 0 && !spotIsCheck,
});

export { familyImpactCell };

/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { ImpactCell } from '@app/compounds/PoolImpactCell';
import { signedCount } from './signed-count';

const familyImpactCell = (spotIsCheck: boolean, upgrades: number, text: (text: Text) => string): ImpactCell => ({
  text: text(msg('randomizer:impact.locUpgrades', { loc: signedCount(spotIsCheck ? 1 : 0), upgrades })),
  muted: upgrades === 0 && !spotIsCheck,
});

export { familyImpactCell };

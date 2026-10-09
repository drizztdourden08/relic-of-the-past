/* @layer renderer-lib @kind logic */
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { PoolImpact } from '@shared/randomizer/world/pool/pool-impact';
import { NOTE_LABEL } from './impact-cell.constants';
import { signedCount } from './signed-count';

const poolImpactCell = (impact: PoolImpact): ImpactCell => (impact.note !== ''
  ? { text: NOTE_LABEL[impact.note] ?? impact.note, muted: true }
  : {
    text: `${signedCount(impact.locations)} loc · ${signedCount(impact.items)} items`,
    muted: impact.locations === 0 && impact.items === 0,
  });

export { poolImpactCell };

/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { ImpactCell } from '@app/compounds/PoolImpactCell';
import type { PoolImpact } from '@rotp/randomizer';
import { NOTE_LABEL } from './impact-cell.constants';
import { signedCount } from './signed-count';

const poolImpactCell = (impact: PoolImpact, text: (text: Text) => string): ImpactCell => (impact.note !== ''
  ? { text: text(NOTE_LABEL[impact.note] ?? impact.note), muted: true }
  : {
    text: text(msg('randomizer:impact.locItems', { loc: signedCount(impact.locations), items: signedCount(impact.items) })),
    muted: impact.locations === 0 && impact.items === 0,
  });

export { poolImpactCell };

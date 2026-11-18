/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { StatusTone } from '@drizztdourden08/tessera/primitives';
import type { MembershipState } from '@drizztdourden08/brock-randomizer/renderer';

const rowChips = (t: I18n['t']): Readonly<Record<MembershipState['kind'], { label: string; tone: StatusTone } | null>> => ({
  pending: { label: t('data-manager:lobby-chip.waiting'), tone: 'warning' },
  failed: { label: t('data-manager:lobby-chip.waiting'), tone: 'warning' },
  approved: { label: t('data-manager:lobby-chip.approved'), tone: 'success' },
  refused: { label: t('data-manager:lobby-chip.refused'), tone: 'danger' },
  gone: { label: t('data-manager:lobby-chip.gone'), tone: 'danger' },
  started: null,
});

export { rowChips };

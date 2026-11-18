/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { StatusTone } from '@drizztdourden08/tessera/primitives';
import type { ArchipeliaMembership } from '@drizztdourden08/brock-randomizer/renderer';
import { rowChips } from './lobby-row-chip.constants';

const lobbyRowChip = (membership: ArchipeliaMembership | undefined, t: I18n['t']): { label: string; tone: StatusTone } | null =>
  (membership === undefined ? null : rowChips(t)[membership.state.kind]);

export { lobbyRowChip };

/* @layer renderer-components @kind logic */
import type { StatusTone } from '@drizztdourden08/tessera/primitives';
import type { ArchipeliaMembership } from '@drizztdourden08/brock-randomizer/renderer';
import { ROW_CHIPS } from './lobby-row-chip.constants';

const lobbyRowChip = (membership: ArchipeliaMembership | undefined): { label: string; tone: StatusTone } | null =>
  (membership === undefined ? null : ROW_CHIPS[membership.state.kind]);

export { lobbyRowChip };

/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { TrackAxis } from '../GridLattice.type';

const ADD_LABEL: Record<TrackAxis, Message> = {
  columns: msg('hud-editor:lattice.add-column'),
  rows: msg('hud-editor:lattice.add-row'),
};

export { ADD_LABEL };

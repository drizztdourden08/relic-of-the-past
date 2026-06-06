/* @layer shared-game @kind data */
import type { ScreenConnection } from '../../../types';

const LW_HINT_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-11', to: 'fortune-teller-light', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-35', to: 'lake-hylia-fortune-teller', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];

export { LW_HINT_CONNECTIONS };

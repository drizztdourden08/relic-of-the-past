import type { ScreenConnection } from '../../../types';

const DW_HINT_CONNECTIONS: ScreenConnection[] = [
  { from: 'dark-desert', to: 'dark-desert-hint', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-11', to: 'fortune-teller-dark', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-12', to: 'dark-sanctuary-hint', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-1e', to: 'palace-of-darkness-hint', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-27', to: 'east-dark-world-hint', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia-ledge-hint', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];

export { DW_HINT_CONNECTIONS };

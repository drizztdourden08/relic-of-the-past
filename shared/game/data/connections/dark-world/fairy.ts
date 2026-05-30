import type { ScreenConnection } from '../../../types';

export const DW_FAIRY_CONNECTIONS: ScreenConnection[] = [
  { from: 'dw-1b', to: 'pyramid-fairy', tags: ['transit:bomb', 'dir:two-way', 'ctx:entrance', 'barrier:bomb'] },
  { from: 'dw-2b', to: 'bonk-fairy-dark', tags: ['transit:bonk', 'dir:two-way', 'ctx:entrance', 'barrier:dash'] },
  { from: 'dw-35', to: 'dark-lake-hylia-healer-fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia-ledge-healer-fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-desert', to: 'dark-desert-healer-fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-death-mountain-west-bottom', to: 'dark-death-mountain-healer-fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];

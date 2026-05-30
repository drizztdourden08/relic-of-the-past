import type { ScreenConnection } from '../../../../types';

/**
 * Connections between Dark World overworld screens and logical area nodes.
 * Each logical area connects to a representative screen in its zone.
 */
export const DW_SCREEN_AREA_CONNECTIONS: ScreenConnection[] = [
  { from: 'dw-27', to: 'east-dark-world', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-20', to: 'west-dark-world', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-2c', to: 'south-dark-world', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-1c', to: 'northeast-dark-world', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-1c', to: 'dark-grassy-lawn', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-top', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-west-bottom', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-east-bottom', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-bunny-descent', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-isolated-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'death-mountain-floating-island-dw', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'mimic-cave-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-1c', to: 'pyramid-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-08', to: 'skull-woods-forest', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-08', to: 'skull-woods-forest-west', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-39', to: 'dark-desert', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-37', to: 'dark-lake-hylia', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-37', to: 'dark-lake-hylia-central-island', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-37', to: 'dark-lake-hylia-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'bumper-cave-entrance', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'bumper-cave-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-27', to: 'catfish', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-20', to: 'hammer-peg-area', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
];

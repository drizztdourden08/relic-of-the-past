import type { RegionConnection } from '../../../types';

/**
 * Connections between Dark World overworld screens and logical area nodes.
 * Each logical area connects to a representative screen in its zone.
 */
export const DW_SCREEN_AREA_CONNECTIONS: RegionConnection[] = [
  { from: 'dw-27', to: 'east-dark-world', entrance: 'East Dark World Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-20', to: 'west-dark-world', entrance: 'West Dark World Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-2c', to: 'south-dark-world', entrance: 'South Dark World Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-1c', to: 'northeast-dark-world', entrance: 'Northeast Dark World Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-1c', to: 'dark-grassy-lawn', entrance: 'Dark Grassy Lawn Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-top', entrance: 'Dark Death Mountain Top Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-west-bottom', entrance: 'Dark Death Mountain West (Bottom) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-east-bottom', entrance: 'Dark Death Mountain East (Bottom) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-bunny-descent', entrance: 'Dark Death Mountain Bunny Descent Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-ledge', entrance: 'Dark Death Mountain Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'dark-death-mountain-isolated-ledge', entrance: 'Dark Death Mountain Isolated Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'death-mountain-floating-island-dw', entrance: 'Floating Island (DW) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'mimic-cave-ledge', entrance: 'Mimic Cave Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-1c', to: 'pyramid-ledge', entrance: 'Pyramid Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-08', to: 'skull-woods-forest', entrance: 'Skull Woods Forest Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-08', to: 'skull-woods-forest-west', entrance: 'Skull Woods Forest (West) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-39', to: 'dark-desert', entrance: 'Dark Desert Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-37', to: 'dark-lake-hylia', entrance: 'Dark Lake Hylia Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-37', to: 'dark-lake-hylia-central-island', entrance: 'Dark Lake Hylia Central Island Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-37', to: 'dark-lake-hylia-ledge', entrance: 'Dark Lake Hylia Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'bumper-cave-entrance', entrance: 'Bumper Cave Entrance Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-0a', to: 'bumper-cave-ledge', entrance: 'Bumper Cave Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-27', to: 'catfish', entrance: 'Catfish Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'dw-20', to: 'hammer-peg-area', entrance: 'Hammer Peg Area Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
];

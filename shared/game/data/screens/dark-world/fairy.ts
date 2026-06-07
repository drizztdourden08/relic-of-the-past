/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../types';

const DW_FAIRY: ScreenDefinition[] = [
  { id: 'bonk-fairy-dark', name: 'Bonk Fairy (Dark)', type: 'interior', world: 'dark', location: 'Dark South', area: 'Dark South', roomIndex: 0xF9, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'dark-lake-hylia-healer-fairy', name: 'Dark Lake Hylia Healer Fairy', type: 'interior', world: 'dark', location: 'Dark Lake', area: 'Dark Lake Hylia', roomIndex: 0xFA, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'dark-lake-hylia-ledge-healer-fairy', name: 'Dark Lake Hylia Ledge Healer Fairy', type: 'interior', world: 'dark', location: 'Dark Lake', area: 'Dark Lake Hylia', roomIndex: 0xFA, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'dark-desert-healer-fairy', name: 'Dark Desert Healer Fairy', type: 'interior', world: 'dark', location: 'Swamp of Evil', area: 'Dark Mire', roomIndex: 0xEA, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'dark-death-mountain-healer-fairy', name: 'Dark Death Mountain Healer Fairy', type: 'interior', world: 'dark', location: 'Dark Death Mountain', area: 'Dark Death Mountain', roomIndex: 0xDF, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'pyramid-fairy', name: 'Pyramid Fairy', type: 'interior', world: 'dark', location: 'Dark Eastern', area: 'Dark East', roomIndex: 0x0121, interior: { kind: 'fairy' }, tags: ['env:underground', 'loot:chest'] },
];

export { DW_FAIRY };

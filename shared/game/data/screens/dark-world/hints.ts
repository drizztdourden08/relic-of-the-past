/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../types';

const DW_HINTS: ScreenDefinition[] = [
  { id: 'dark-desert-hint', name: 'Dark Desert Hint', type: 'interior', world: 'dark', location: 'Swamp of Evil', area: 'Dark Mire', roomIndex: 0x010E, interior: { kind: 'hint' }, tags: ['env:underground'] },
  { id: 'fortune-teller-dark', name: 'Fortune Teller (Dark)', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x011B, interior: { kind: 'hint' }, tags: ['env:indoor'] },
  { id: 'dark-sanctuary-hint', name: 'Dark Sanctuary Hint', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x011C, interior: { kind: 'hint' }, tags: ['env:indoor'] },
  { id: 'palace-of-darkness-hint', name: 'Palace of Darkness Hint', type: 'interior', world: 'dark', location: 'Dark Eastern', area: 'Dark East', roomIndex: 0x0122, interior: { kind: 'hint' }, tags: ['env:underground'] },
  { id: 'east-dark-world-hint', name: 'East Dark World Hint', type: 'interior', world: 'dark', location: 'Dark Eastern', area: 'Dark East', roomIndex: 0x0122, interior: { kind: 'hint' }, tags: ['env:underground'] },
  { id: 'dark-lake-hylia-ledge-hint', name: 'Dark Lake Hylia Ledge Hint', type: 'interior', world: 'dark', location: 'Dark Lake', area: 'Dark Lake Hylia', roomIndex: 0x011A, interior: { kind: 'hint' }, tags: ['env:underground'] },
];

export { DW_HINTS };

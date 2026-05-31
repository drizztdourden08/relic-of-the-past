import type { ScreenDefinition } from '../../../types';

export const LW_PASSAGES: ScreenDefinition[] = [
  { id: 'hyrule-castle-secret-passage', name: 'Secret Passage', type: 'interior', world: 'light', location: 'Hyrule Castle', area: 'Hyrule Castle', roomIndex: 0x55, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector'] },
  { id: 'hyrule-castle-secret-entrance', name: 'Hyrule Castle Secret Entrance', type: 'interior', world: 'light', location: 'Hyrule Castle', area: 'Hyrule Castle', roomIndex: 0x0126, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector'] },
  { id: 'old-man-cave', name: 'Old Man Cave', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xF0, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector'] },
  { id: 'spectacle-rock-cave-bottom', name: 'Spectacle Rock Cave (Bottom)', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xE3, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector'] },
  { id: 'spectacle-rock-cave-peak', name: 'Spectacle Rock Cave (Peak)', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xE2, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector'] },
  { id: 'death-mountain-return-cave', name: 'Death Mountain Return Cave', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xF2, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector'] },
  { id: 'spiral-cave-bottom', name: 'Spiral Cave (Bottom)', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xFB, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector'] },
  { id: 'fairy-ascension-cave-bottom', name: 'Fairy Ascension Cave (Bottom)', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xF8, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector'] },
  { id: 'fairy-ascension-cave-drop', name: 'Fairy Ascension Cave (Drop)', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xF8, interior: { kind: 'passage' }, tags: ['env:underground', 'traverse:fall'] },
  { id: 'fairy-ascension-cave-top', name: 'Fairy Ascension Cave (Top)', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xE8, interior: { kind: 'passage' }, tags: ['env:underground', 'role:connector'] },
];

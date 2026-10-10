/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import {
  containerKind, ghostFor, ghostPosition,
} from '@app/hud-layout-editing/drop-ghost';
import { outlineIntent } from '@app/hud-layout-editing/drop-intent';
import { DOC } from './ghost-doc.constants';

describe('line 1 states the KIND, in §42\'s vocabulary and no other', () => {
  it('says row, column, grid n×m, overlap and screen but never stack', () => {
    const kind = (id: string): string => {
      const found = [DOC.screen, ...DOC.screen.children].find((n) => n.id === id);
      return containerKind(found ?? null, id === 'screen');
    };
    expect(kind('hud')).toBe('column');
    expect(kind('badge')).toBe('grid 3×2');
    expect(kind('overlay')).toBe('overlap');
    expect(kind('screen')).toBe('screen');
    expect(containerKind(DOC.screen.children[0].children[0], false)).toBe('row');
    const single = { ...DOC.screen.children[1], children: [DOC.screen.children[1].children[0]] };
    expect(containerKind(single, false)).toBe('grid 3×1');
  });
});

describe('the four states', () => {
  it('FLEX names a position among the children it would have', () => {
    const ghost = ghostFor(DOC, ['magic-bar'], { kind: 'flex', parentId: 'hud', index: 1 });
    expect(ghost).toMatchObject({ tone: 'move', chip: 'magic-bar', kind: 'into column' });
    expect(ghost.position).toBe('position 2 of 2');
    expect(ghost.path).toBe('screen › hud');
  });

  it('an empty GRID cell names the cell and the word `empty`', () => {
    const ghost = ghostFor(DOC, ['hearts'], {
      kind: 'grid', parentId: 'screen', place: { column: 3, row: 1 }, onto: null,
    });
    expect(ghost.kind).toBe('into screen');
    expect(ghost.position).toBe('cell 3,1 · empty');
    expect(ghost.path).toBe('screen');
  });

  it('a co-placed GRID cell says `with`, which is the whole difference', () => {
    const ghost = ghostFor(DOC, ['glyph'], {
      kind: 'grid', parentId: 'badge', place: { column: 1, row: 1 }, onto: 'life_pip',
    });
    expect(ghost.position).toBe('cell 1,1 · with life_pip');
    expect(ghost.tone).toBe('move');
  });

  it('REFUSED turns the whole card, and line 2 names BOTH nodes', () => {
    const intent = outlineIntent(DOC, 'pip1', 'inside-start', ['hearts']);
    const ghost = ghostFor(DOC, ['hearts'], intent);
    expect(ghost.tone).toBe('refused');
    expect(ghost.kind).toBe('refused');
    expect(ghost.position).toContain('hearts');
    expect(ghost.position).toContain('pip1');
    expect(ghost.path).toBe('screen › hud › hearts › pip1');
  });

});

describe('line 3 carries the one thing no other surface says', () => {
  it('warns that the drop lands in a template drawn N times', () => {
    const ghost = ghostFor(DOC, ['magic-bar'], { kind: 'flex', parentId: 'heart', index: 0 });
    expect(ghost.path).toBe('inside repeat ×8');
    expect(ghost.warn).toBe(true);
  });
});

describe('where the card sits', () => {
  it('is below-right of the cursor by +14, +18', () => {
    expect(ghostPosition({ x: 400, y: 300 }, { w: 1400, h: 900 }))
      .toEqual({ left: 414, top: 318, transform: 'translate(0, 0)' });
  });

  it('flips to above-left within 150 px of the viewport edge', () => {
    expect(ghostPosition({ x: 1380, y: 880 }, { w: 1400, h: 900 }))
      .toEqual({ left: 1366, top: 862, transform: 'translate(-100%, -100%)' });
    expect(ghostPosition({ x: 1380, y: 300 }, { w: 1400, h: 900 }).transform)
      .toBe('translate(-100%, 0)');
  });
});

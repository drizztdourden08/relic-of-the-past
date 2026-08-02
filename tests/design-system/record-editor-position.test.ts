/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { RecordEditor, positionPairOf } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import {
  numberBoundsResolverFor, resolveNumberBoundsFor, withoutIndices,
} from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/number-bounds';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';

// SSR smoke tests plus unit tests over the shape check and the bounds rule.
// They prove which control a grid position is offered as and which limits reach
// it for a given record. Typing a coordinate, stepping it and watching it clamp
// need a browser and are NOT covered here.

const PAIR_CONTROL = 'class="position-input';

const screens = all('screen');

const fieldAt = (rows: readonly unknown[], path: string): FieldDescriptor => {
  const field = buildSchema(rows).find((entry) => entry.path === path);
  if (!field) throw new Error(`no field at ${path}`);
  return field;
};

const render = (record: unknown): string =>
  renderToStaticMarkup(createElement(RecordEditor, {
    record,
    schema: buildSchema(screens),
    onSave: async () => undefined,
    resolveNumberBounds: numberBoundsResolverFor('screen'),
  }));

describe('which nested object is a grid position', () => {
  it('recognises the real one, by the pair it carries', () => {
    const pair = positionPairOf(fieldAt(screens, 'position'));
    expect(pair).toBeDefined();
    expect(pair?.xKey).toBe('gridX');
    expect(pair?.yKey).toBe('gridY');
  });

  it('keeps whatever the object holds besides the pair as rows of its own', () => {
    const pair = positionPairOf(fieldAt(screens, 'position'));
    expect(pair?.others.map((child) => child.path)).toEqual(['position.floor']);
  });

  it('leaves a rectangle alone — extents are not a second coordinate', () => {
    const rect = buildSchema(all('connection'))
      .find((entry) => entry.path === 'placement')?.children
      ?.find((child) => child.path === 'placement.rect');
    expect(rect).toBeDefined();
    expect(positionPairOf(rect as FieldDescriptor)).toBeUndefined();
  });

  it('needs both halves of the pair, and needs them to be numbers', () => {
    const number = (path: string): FieldDescriptor =>
      ({ path, label: path, kind: 'number', optional: false });
    const object = (children: readonly FieldDescriptor[]): FieldDescriptor =>
      ({ path: 'at', label: 'At', kind: 'object', optional: false, children });

    expect(positionPairOf(object([number('at.gridX'), number('at.gridY')]))).toBeDefined();
    expect(positionPairOf(object([number('at.gridX')]))).toBeUndefined();
    expect(positionPairOf(object([
      number('at.gridX'), { ...number('at.gridY'), kind: 'string' },
    ]))).toBeUndefined();
  });
});

describe('how far a coordinate may go, per record', () => {
  const overworld = screens.find((row) => row.kind === 'overworld' && row.position);
  const indoors = screens.find((row) => row.kind === 'dungeon' && row.position);

  it('found a real record of each sort to ask about', () => {
    expect(overworld).toBeDefined();
    expect(indoors).toBeDefined();
  });

  it('bounds an outdoor screen to the 8-by-8 map', () => {
    expect(resolveNumberBoundsFor('screen', 'position.gridX', overworld)).toEqual({ min: 0, max: 7 });
    expect(resolveNumberBoundsFor('screen', 'position.gridY', overworld)).toEqual({ min: 0, max: 7 });
  });

  it('bounds an indoor screen to the wider room grid', () => {
    expect(resolveNumberBoundsFor('screen', 'position.gridX', indoors)).toEqual({ min: 0, max: 15 });
    expect(resolveNumberBoundsFor('screen', 'position.gridY', indoors)).toEqual({ min: 0, max: 14 });
  });

  it('gives the same field two different answers, which is why it takes the record', () => {
    const forX = (record: unknown) => resolveNumberBoundsFor('screen', 'position.gridX', record);
    expect(forX(overworld)).not.toEqual(forX(indoors));
  });

  it('holds every real record inside the bounds it would be given', () => {
    for (const row of screens) {
      if (!row.position) continue;
      const x = resolveNumberBoundsFor('screen', 'position.gridX', row);
      const y = resolveNumberBoundsFor('screen', 'position.gridY', row);
      expect(row.position.gridX, row.id).toBeLessThanOrEqual(x?.max ?? Infinity);
      expect(row.position.gridY, row.id).toBeLessThanOrEqual(y?.max ?? Infinity);
      expect(row.position.gridX, row.id).toBeGreaterThanOrEqual(x?.min ?? -Infinity);
      expect(row.position.gridY, row.id).toBeGreaterThanOrEqual(y?.min ?? -Infinity);
    }
  });

  it('bounds the floor, which is part of the position but not of the pair', () => {
    const floor = resolveNumberBoundsFor('screen', 'position.floor', indoors);
    expect(floor).toEqual({ min: -7, max: 6 });
    for (const row of screens) {
      const held = row.position?.floor;
      if (held === undefined) continue;
      expect(held, row.id).toBeGreaterThanOrEqual(-7);
      expect(held, row.id).toBeLessThanOrEqual(6);
    }
  });

  it('folds an index out of the path, so one rule covers every element', () => {
    expect(withoutIndices('spawns.3.tile.x')).toBe('spawns[].tile.x');
    expect(withoutIndices('position.gridX')).toBe('position.gridX');
    const bounds = resolveNumberBoundsFor('screen', 'spawns.7.tile.y', indoors);
    expect(bounds).toEqual({ min: 0, max: 63 });
  });

  it('says nothing for a field or a collection it has no rule for', () => {
    expect(resolveNumberBoundsFor('screen', 'gameId.roomIndex', indoors)).toBeUndefined();
    expect(resolveNumberBoundsFor('item', 'position.gridX', indoors)).toBeUndefined();
    expect(numberBoundsResolverFor('screen')).toBe(numberBoundsResolverFor('screen'));
  });
});

describe('the whole form, with a real position on it', () => {
  it('renders the pair as one control, with the record\'s own limits on it', () => {
    const overworld = screens.find((row) => row.kind === 'overworld' && row.position);
    const markup = render(overworld);
    expect(markup).toContain(PAIR_CONTROL);
    expect(markup).toContain('max="7"');
    expect(markup).toContain(`value="${String(overworld?.position?.gridX)}"`);
  });

  it('gives an indoor screen the wider limits on the same field', () => {
    const indoors = screens.find((row) => row.kind === 'dungeon' && row.position);
    const markup = render(indoors);
    expect(markup).toContain('max="15"');
    expect(markup).toContain('max="14"');
  });

  it('keeps the floor as its own bounded row beside the pair', () => {
    const indoors = screens.find((row) => row.kind === 'dungeon' && row.position?.floor !== undefined);
    expect(indoors).toBeDefined();
    const markup = render(indoors);
    expect(markup).toContain('Floor');
    expect(markup).toContain('min="-7"');
    expect(markup).toContain('max="6"');
  });

  it('renders a record that has no position at all without throwing', () => {
    const none = screens.find((row) => row.position === undefined);
    expect(none).toBeDefined();
    expect(() => render(none)).not.toThrow();
  });
});

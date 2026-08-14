/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { defaultOperatorFor, operatorsFor } from '../../apps/web/src/ui/design-system/data/filter/operators';
import { resolveFieldKit } from '../../apps/web/src/ui/design-system/composites/field-kits';
import { formatIdRefDisplay } from '../../apps/web/src/ui/design-system/composites/field-kits/id-ref-format';
import type { CellRenderOptions } from '../../apps/web/src/ui/design-system/composites/field-kits/registry';
import type { FieldDescriptor, FieldKind } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

// There is no jsdom or testing-library in this repo, so these are SSR smoke
// tests: they prove each control and cell renders without throwing for a
// representative value of its kind. Appearance and interaction (opening the
// multi-select, typing, clicking a reference) are NOT covered here.

const field = (kind: FieldKind, extra: Partial<FieldDescriptor> = {}): FieldDescriptor => ({
  path: 'sample', label: 'Sample', kind, optional: false, ...extra,
});

const kitFor = (kind: FieldKind) => {
  const kit = resolveFieldKit(kind);
  if (!kit) throw new Error(`no kit registered for ${kind}`);
  return kit;
};

const renderFilter = (descriptor: FieldDescriptor, op: string, value: unknown): string =>
  renderToStaticMarkup(createElement(kitFor(descriptor.kind).FilterControl, {
    field: descriptor, op, value, onChange: () => undefined,
  }));

const renderEditor = (descriptor: FieldDescriptor, value: unknown): string =>
  renderToStaticMarkup(createElement(kitFor(descriptor.kind).EditorControl, {
    field: descriptor, value, onChange: () => undefined,
  }));

const renderCell = (descriptor: FieldDescriptor, value: unknown, options?: CellRenderOptions): string =>
  renderToStaticMarkup(createElement('div', null, kitFor(descriptor.kind).renderCell(value, descriptor, options)));

const screenRow = all('screen')[0] as Record<string, unknown>;
const connectionRow = all('connection')[0] as Record<string, unknown>;

const SAMPLES: readonly { kind: FieldKind; descriptor: FieldDescriptor; value: unknown }[] = [
  { kind: 'string', descriptor: field('string'), value: 'a piece of free text' },
  { kind: 'number', descriptor: field('number'), value: 42 },
  { kind: 'boolean', descriptor: field('boolean'), value: true },
  {
    kind: 'enum',
    descriptor: field('enum', { options: ['north', 'south', 'east', 'west'] }),
    value: 'north',
  },
  {
    kind: 'idRef',
    descriptor: field('idRef', { targetKind: 'screen' }),
    value: screenRow.id,
  },
  {
    kind: 'array',
    descriptor: field('array', { of: field('string', { path: 'sample[]' }) }),
    value: ['first', 'second', 'third'],
  },
  { kind: 'object', descriptor: field('object'), value: { x: 1, y: 2, z: 3 } },
  { kind: 'union', descriptor: field('union'), value: connectionRow.placement },
  { kind: 'unknown', descriptor: field('unknown'), value: connectionRow },
];

describeDataset('field kits — every control and cell renders', () => {
  for (const { kind, descriptor, value } of SAMPLES) {
    it(`${kind}: filter, editor and cell`, () => {
      expect(() => renderFilter(descriptor, defaultOperatorFor(kind), null)).not.toThrow();
      expect(() => renderEditor(descriptor, value)).not.toThrow();
      expect(renderCell(descriptor, value)).toContain('<');
    });

    it(`${kind}: renders for every operator it offers`, () => {
      for (const spec of operatorsFor(kind)) {
        const operand = spec.arity === 'many' ? [] : null;
        expect(() => renderFilter(descriptor, spec.id, operand), `${kind}.${spec.id}`).not.toThrow();
      }
    });

    it(`${kind}: renders an absent value without throwing`, () => {
      expect(() => renderEditor(descriptor, undefined)).not.toThrow();
      expect(() => renderCell(descriptor, undefined)).not.toThrow();
    });
  }
});

describeDataset('field kits — the parts a screen has to bind to', () => {
  it('marks an id cell with the id and the collection it points at', () => {
    const markup = renderCell(field('idRef', { targetKind: 'screen' }), 'screen-183');
    expect(markup).toContain('data-id-ref="screen-183"');
    expect(markup).toContain('data-target-kind="screen"');
    expect(markup).toContain('screen-183');
  });

  it('renders a real record id from the live dataset', () => {
    const markup = renderCell(field('idRef', { targetKind: 'screen' }), screenRow.id);
    expect(markup).toContain(String(screenRow.id));
  });

  it('renders no filter control where the operator takes no operand', () => {
    expect(renderFilter(field('boolean'), 'isTrue', null)).toBe('');
    expect(renderFilter(field('object'), 'isEmpty', null)).toBe('');
    expect(renderFilter(field('union'), 'isEmpty', null)).toBe('');
    expect(renderFilter(field('unknown'), 'isEmpty', null)).toBe('');
    expect(renderFilter(field('string'), 'isEmpty', null)).toBe('');
  });

  it('gives the number kind a two-ended control for between, one otherwise', () => {
    const descriptor = field('number');
    expect(renderFilter(descriptor, 'between', [1, 10]).match(/<input/g)).toHaveLength(2);
    expect(renderFilter(descriptor, 'gt', 5).match(/<input/g)).toHaveLength(1);
  });

  it('offers the closed set as a multi-select trigger, and one value in the editor', () => {
    const descriptor = field('enum', { options: ['north', 'south'] });
    expect(renderFilter(descriptor, 'anyOf', ['north', 'south'])).toContain('north, south');
    expect(renderEditor(descriptor, 'north')).toContain('north');
  });

  it('summarises a list as a count plus a preview', () => {
    const descriptor = field('array', { of: field('string', { path: 'sample[]' }) });
    expect(renderEditor(descriptor, ['a', 'b'])).toContain('2 items');
    expect(renderCell(descriptor, [])).toContain('none');
  });
});

describeDataset('formatIdRefDisplay — the one "Name (id)" rule every reference reads through', () => {
  it('reads as "Name (id)" once a name resolves', () => {
    expect(formatIdRefDisplay('screen-183', 'Jail Cell')).toBe('Jail Cell (screen-183)');
  });

  it('falls back to the bare id, no dangling parens, when nothing resolves', () => {
    expect(formatIdRefDisplay('screen-183', undefined)).toBe('screen-183');
    expect(formatIdRefDisplay('screen-183', '')).toBe('screen-183');
    expect(formatIdRefDisplay('screen-183', '   ')).toBe('screen-183');
  });

  it('does not double up when the resolver just echoes the id back', () => {
    expect(formatIdRefDisplay('screen-183', 'screen-183')).toBe('screen-183');
  });
});

describeDataset('idRef cell — reads through the same formatter', () => {
  it('shows "Name (id)" once a display name is passed', () => {
    const markup = renderCell(field('idRef', { targetKind: 'screen' }), 'screen-183', { display: 'Jail Cell' });
    expect(markup).toContain('Jail Cell (screen-183)');
    expect(markup).not.toContain('>screen-183<');
  });

  it('falls back to the bare id with no display passed', () => {
    const markup = renderCell(field('idRef', { targetKind: 'screen' }), 'screen-183');
    expect(markup).toContain('>screen-183<');
  });
});

describeDataset('array of idRef — one resolved chip per entry, not a flattened summary', () => {
  const descriptor = field('array', { of: field('idRef', { path: 'sample[]', targetKind: 'screen' }) });

  it('resolves each entry through the injected per-element resolver', () => {
    const names: Record<string, string> = { 'screen-001': 'Jail Cell', 'screen-002': 'Sanctuary' };
    const markup = renderCell(descriptor, ['screen-001', 'screen-002'], {
      resolveIdRefDisplay: (id) => names[id],
    });
    expect(markup).toContain('Jail Cell (screen-001)');
    expect(markup).toContain('Sanctuary (screen-002)');
    // Not the flattened one-line text every other array gets.
    expect(markup).not.toContain('screen-001, screen-002');
  });

  it('marks every chip for cross-record navigation, same handoff as the scalar case', () => {
    const markup = renderCell(descriptor, ['screen-001', 'screen-002'], { resolveIdRefDisplay: () => undefined });
    expect(markup).toContain('data-id-ref="screen-001"');
    expect(markup).toContain('data-id-ref="screen-002"');
    expect(markup).toContain('data-target-kind="screen"');
  });

  it('falls back to the bare id per entry with no resolver wired', () => {
    const markup = renderCell(descriptor, ['screen-001', 'screen-002']);
    expect(markup).toContain('>screen-001<');
    expect(markup).toContain('>screen-002<');
  });

  it('skips a blank entry rather than rendering an empty chip', () => {
    const markup = renderCell(descriptor, ['screen-001', '', '  ']);
    expect(markup.match(/data-id-ref=/g)?.length).toBe(1);
  });
});

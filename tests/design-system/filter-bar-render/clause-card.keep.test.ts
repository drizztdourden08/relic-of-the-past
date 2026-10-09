/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createClause, defaultOperatorFor, findOperator, operatorsFor } from '@drizztdourden08/tessera/data';
import { FilterClauseCard } from '@drizztdourden08/tessera/composites';
import type { FieldDescriptor, FilterClause } from '@drizztdourden08/tessera/data';
import { DESCRIPTORS, KINDS } from './filter-bar-render.constants';
import { field } from './field';

const operandFor = (arity: 'none' | 'one' | 'many'): unknown => (arity === 'many' ? [] : null);

const renderClause = (descriptor: FieldDescriptor, clause: FilterClause): string =>
  renderToStaticMarkup(createElement(FilterClauseCard, {
    field: descriptor,
    clause,
    onChangeOperator: () => undefined,
    onChangeValue: () => undefined,
    onChangeCaseSensitive: () => undefined,
    onToggleEnabled: () => undefined,
    onRemove: () => undefined,
  }));

const renderRow = (descriptor: FieldDescriptor, op: string): string => {
  const arity = findOperator(descriptor.kind, op)?.arity ?? 'one';
  return renderClause(descriptor, createClause(descriptor.path, op, operandFor(arity)));
};

describe('FilterClauseCard renders across every field kind', () => {
  for (const kind of KINDS) {
    const descriptor = DESCRIPTORS[kind];

    it(`${kind}: renders on the kind's default operator`, () => {
      expect(() => renderRow(descriptor, defaultOperatorFor(kind))).not.toThrow();
    });

    it(`${kind}: renders for every operator the kind offers`, () => {
      for (const spec of operatorsFor(kind)) {
        expect(() => renderRow(descriptor, spec.id), `${kind}.${spec.id}`).not.toThrow();
      }
    });
  }

  it('collapses the control region for an arity-\'none\' operator', () => {
    expect(renderRow(field('boolean'), 'isTrue')).not.toContain('filter-bar__control');
    expect(renderRow(field('object'), 'isEmpty')).not.toContain('filter-bar__control');
  });

  it('still shows a control for an arity-\'one\' or arity-\'many\' operator', () => {
    expect(renderRow(field('string'), 'contains')).toContain('filter-bar__control');
    expect(renderRow(field('enum', { options: ['a'] }), 'anyOf')).toContain('filter-bar__control');
  });

  it('collapses the control for array\'s isEmpty even though the kit itself renders one', () => {
    const descriptor = field('array', { of: field('string', { path: 'sample[]' }) });
    expect(renderRow(descriptor, 'isEmpty')).not.toContain('filter-bar__control');
  });

  it('keeps a disabled clause\'s checkbox rendered, not removed', () => {
    const descriptor = field('string');
    const markup = renderClause(descriptor, {
      ...createClause(descriptor.path, 'contains', 'x'), enabled: false,
    });
    expect(markup).toContain('type="checkbox"');
  });
});

describe('FilterClauseCard: the hooks the merged-strip styling needs', () => {
  const descriptor = field('string');

  it('wraps the enable box, the operator and the control in one group', () => {
    const markup = renderRow(descriptor, 'contains');
    expect(markup).toContain('filter-bar__group');
    expect(markup).toContain('filter-bar__check');
    expect(markup).toContain('filter-bar__operator-button');
    expect(markup).toContain('filter-bar__control');
  });

  it('tells the group when the operator ends the strip, and when it does not', () => {
    expect(renderRow(descriptor, 'isEmpty')).toContain('filter-bar__group--no-control');
    expect(renderRow(descriptor, 'contains')).not.toContain('filter-bar__group--no-control');
  });

  it('marks the clause disabled only while it is switched off', () => {
    const clause = createClause(descriptor.path, 'contains', 'x');
    expect(renderClause(descriptor, clause)).not.toContain('filter-bar__clause--disabled');
    expect(renderClause(descriptor, { ...clause, enabled: false }))
      .toContain('filter-bar__clause--disabled');
  });

  it('leaves a disabled clause\'s control in the markup, editable instead of inert', () => {
    const markup = renderClause(descriptor, {
      ...createClause(descriptor.path, 'contains', 'x'), enabled: false,
    });
    expect(markup).toContain('filter-bar__control');
    expect(markup).not.toContain('disabled=""');
  });

  it('always renders the remove button, because hiding it until hover is the stylesheet\'s job', () => {
    expect(renderClause(descriptor, createClause(descriptor.path, 'contains', 'x')))
      .toContain('aria-label="Remove filter on Sample"');
  });
});

describe('FilterClauseCard: the compact clause layout', () => {
  const CARDS: readonly (readonly [string, FieldDescriptor, string])[] = [
    ['text', field('string'), 'contains'],
    ['a number', field('number'), 'eq'],
    ['a two-ended range', field('number'), 'between'],
    ['a closed set', field('enum', { options: ['north', 'south'] }), 'anyOf'],
    ['a list', field('array', { of: field('string', { path: 'sample[]' }) }), 'containsValue'],
  ];

  for (const [what, descriptor, op] of CARDS) {
    it(`${what}: builds a caption over one control strip`, () => {
      const markup = renderRow(descriptor, op);
      for (const cls of [
        'filter-bar__clause', 'filter-bar__field-label',
        'filter-bar__remove', 'filter-bar__group', 'filter-bar__control',
      ]) {
        expect(markup, `${what} is missing ${cls}`).toContain(cls);
      }
    });

    it(`${what}: draws no container around the caption and the strip`, () => {
      const markup = renderRow(descriptor, op);
      expect(markup, `${what} still renders the old card box`).not.toContain('filter-bar__card');
      expect(markup, `${what} still renders the old label row`).not.toContain('filter-bar__head');
    });
  }

  it('writes the field name once as text, as the caption', () => {
    expect(renderRow(field('string'), 'contains').match(/>Sample</g) ?? []).toHaveLength(1);
  });

  it('drops the enable box\'s own visible label, since the caption carries the name', () => {
    expect(renderRow(field('string'), 'contains')).not.toContain('checkbox__label');
  });

  it('keeps the enable box named for a screen reader all the same', () => {
    expect(renderRow(field('string'), 'contains'))
      .toContain('aria-label="Apply the Sample filter"');
  });

  it('puts the remove badge inside the strip, past the control it sits on', () => {
    const markup = renderRow(field('string'), 'contains');
    const strip = markup.slice(markup.indexOf('filter-bar__group'));
    expect(strip).toContain('filter-bar__remove');
    expect(strip.indexOf('filter-bar__remove')).toBeGreaterThan(strip.indexOf('filter-bar__control'));
  });

  it('keeps the badge on an operator that ends the strip, where there is no control', () => {
    const strip = renderRow(field('string'), 'isEmpty');
    expect(strip.indexOf('filter-bar__remove')).toBeGreaterThan(strip.indexOf('filter-bar__group'));
  });

  it('draws the badge with the house close glyph instead of a thin ×', () => {
    expect(renderRow(field('string'), 'contains')).toContain('✕');
  });
});

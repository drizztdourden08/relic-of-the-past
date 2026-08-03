/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import { defaultOperatorFor, findOperator, operatorsFor } from '../../apps/web/src/ui/design-system/data/filter/operators';
import { FilterClauseCard } from '../../apps/web/src/ui/design-system/composites/FilterBar/sub-components/FilterClauseCard';
import { OperatorMenu } from '../../apps/web/src/ui/design-system/composites/FilterBar/sub-components/OperatorMenu';
import type { FieldDescriptor, FieldKind } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import type { FilterClause } from '../../apps/web/src/ui/design-system/data/filter/clause';

// There is no jsdom or testing-library in this repo, so these are SSR smoke
// tests, matching tests/design-system/field-kit-render.test.ts: they prove
// each composite renders without throwing. Opening the operator dropdown,
// opening the "+ Add filter" picker, and clicking a real option are NOT
// covered — there is no browser in this pass.
//
// FilterBar itself is intentionally NOT imported here: its "+ Add filter"
// button reuses DataTable's FieldPicker sub-component, which had not landed
// in this repo at the time this test was written, so importing FilterBar
// would fail module resolution. FilterClauseCard and OperatorMenu are
// everything FilterBar assembles other than that one button, and both are
// covered in full below.

const field = (kind: FieldKind, extra: Partial<FieldDescriptor> = {}): FieldDescriptor => ({
  path: 'sample', label: 'Sample', kind, optional: false, ...extra,
});

const KINDS: readonly FieldKind[] = [
  'string', 'number', 'boolean', 'enum', 'idRef', 'array', 'object', 'union', 'unknown',
];

const DESCRIPTORS: Record<FieldKind, FieldDescriptor> = {
  string: field('string'),
  number: field('number'),
  boolean: field('boolean'),
  enum: field('enum', { options: ['north', 'south'] }),
  idRef: field('idRef', { targetKind: 'screen' }),
  array: field('array', { of: field('string', { path: 'sample[]' }) }),
  object: field('object'),
  union: field('union'),
  unknown: field('unknown'),
};

/** Mirrors field-kit-render.test.ts: a filter operand only ever needs to be
 * shaped for the operator's arity, not for any particular row's value. */
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

const renderOperatorMenu = (descriptor: FieldDescriptor, op: string, caseSensitive?: boolean): string =>
  renderToStaticMarkup(createElement(OperatorMenu, {
    field: descriptor, op, caseSensitive, onChange: () => undefined,
  }));

describe('FilterClauseCard — renders across every field kind', () => {
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

// The merged look itself (one seamless strip, the × fading in on hover, the
// greyed-out treatment) is CSS, and there is no browser in this pass. What is
// checkable here is the markup those rules hang off: the classes have to be
// present, and keyed off the right state.
describe('FilterClauseCard — the hooks the merged-strip styling needs', () => {
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

  it('leaves a disabled clause\'s control in the markup, editable rather than inert', () => {
    const markup = renderClause(descriptor, {
      ...createClause(descriptor.path, 'contains', 'x'), enabled: false,
    });
    expect(markup).toContain('filter-bar__control');
    expect(markup).not.toContain('disabled=""');
  });

  it('always renders the remove button — hiding it until hover is the stylesheet\'s job', () => {
    expect(renderClause(descriptor, createClause(descriptor.path, 'contains', 'x')))
      .toContain('aria-label="Remove filter on Sample"');
  });
});

// The layout itself — whether the clauses really wrap, whether the badge fades
// in on hover and lands on the strip's corner, whether every clause lands at
// the same height — is CSS, and there is no browser in this pass. What is
// checkable is that the structure those rules hang off is built the same way
// for every kind of control, from a plain text box to a two-ended range.
describe('FilterClauseCard — the compact clause layout', () => {
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

  // The badge is pinned to the strip's top-right corner by the stylesheet,
  // which can only reach it from inside the strip — hence the position in the
  // markup. Being last there is also what puts it on top of the segment it
  // overlaps without a stacking order, and what keeps it the last tab stop.
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

  it('draws the badge with the house close glyph rather than a thin ×', () => {
    expect(renderRow(field('string'), 'contains')).toContain('✕');
  });
});

describe('OperatorMenu — icon-only button, text stays in the dropdown', () => {
  for (const kind of KINDS) {
    it(`${kind}: renders without throwing`, () => {
      expect(() => renderOperatorMenu(DESCRIPTORS[kind], defaultOperatorFor(kind))).not.toThrow();
    });
  }

  it('shows only the glyph as visible content — the label lives in aria-label, not as text', () => {
    const markup = renderOperatorMenu(field('number'), 'gte');
    // The label is expected in the accessible name (screen-reader only);
    // the icon-only requirement is about VISIBLE content, so strip that
    // attribute before asserting the label is nowhere else in the markup.
    expect(markup).toContain('aria-label="Filter operator: is at least"');
    const visible = markup.replace(/aria-label="[^"]*"/g, '');
    expect(visible).not.toContain('is at least');
    expect(visible).toContain('≥');
  });

  it('names the current operator in the accessible label', () => {
    expect(renderOperatorMenu(field('string'), 'startsWith'))
      .toContain('aria-label="Filter operator: starts with"');
  });

  it('marks the button — with a class and in the label — only when case matters', () => {
    const plain = renderOperatorMenu(field('string'), 'contains');
    expect(plain).not.toContain('filter-bar__operator-button--cased');
    expect(plain).toContain('aria-label="Filter operator: contains"');

    const cased = renderOperatorMenu(field('string'), 'contains', true);
    expect(cased).toContain('filter-bar__operator-button--cased');
    expect(cased).toContain('aria-label="Filter operator: contains, match case"');
  });

  it('ignores a stale flag on a kind that has no case to match', () => {
    const stale = renderOperatorMenu(field('number'), 'eq', true);
    expect(stale).not.toContain('filter-bar__operator-button--cased');
    expect(stale).toContain('aria-label="Filter operator: is"');
  });

  it('keeps the button icon-only even with the modifier on', () => {
    const visible = renderOperatorMenu(field('string'), 'contains', true)
      .replace(/aria-label="[^"]*"/g, '');
    expect(visible).not.toContain('match case');
    expect(visible).toContain('∋');
  });
});

/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { ENUM_MAX } from '../../apps/web/src/ui/design-system/data/schema/infer-kind';
import { resolveFieldKit } from '../../apps/web/src/ui/design-system/composites/field-kits';
import { RecordEditor } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';

// SSR smoke tests again — there is no jsdom here. They prove WHICH control a
// closed set is offered as, and that it renders. Clicking a chip, dragging the
// segmented indicator and keyboard traversal are NOT covered.
//
// Every enum editor is now a decorator around its picker (see OpenSetControl),
// so the picker is the decorator's single child. The prop-level assertions
// reach through that one hop rather than reading the returned element itself.

const SEGMENTED = 'class="segmented';
const CHIPS = 'class="tag-picker';
const DROPDOWN = 'class="select-trigger';

const pickerOf = <P,>(element: unknown): { props: P } =>
  (element as { props: { children: { props: P } } }).props.children;

const enumField = (count: number): FieldDescriptor => ({
  path: 'sample',
  label: 'Sample',
  kind: 'enum',
  optional: false,
  options: Array.from({ length: count }, (_unused, at) => `option-${at + 1}`),
});

const renderEnumEditor = (field: FieldDescriptor, value: unknown): string => {
  const kit = resolveFieldKit('enum');
  if (!kit) throw new Error('no enum kit registered');
  return renderToStaticMarkup(createElement(kit.EditorControl, {
    field, value, onChange: () => undefined,
  }));
};

const controlOf = (markup: string): string => {
  if (markup.includes(SEGMENTED)) return 'segmented';
  if (markup.includes(CHIPS)) return 'chips';
  if (markup.includes(DROPDOWN)) return 'dropdown';
  return 'unknown';
};

describe('enum editor — the control follows the option count', () => {
  it('offers a segmented track up to four options', () => {
    for (const count of [1, 2, 3, 4]) {
      expect(controlOf(renderEnumEditor(enumField(count), 'option-1')), `${count} options`)
        .toBe('segmented');
    }
  });

  it('offers chips from five options up to the closed-set ceiling', () => {
    for (const count of [5, 8, ENUM_MAX]) {
      expect(controlOf(renderEnumEditor(enumField(count), 'option-1')), `${count} options`)
        .toBe('chips');
    }
  });

  it('falls back to a dropdown past the ceiling, and with no options at all', () => {
    expect(controlOf(renderEnumEditor(enumField(ENUM_MAX + 1), 'option-1'))).toBe('dropdown');
    const bare: FieldDescriptor = { path: 'sample', label: 'Sample', kind: 'enum', optional: false };
    expect(controlOf(renderEnumEditor(bare, ''))).toBe('dropdown');
  });

  it('marks exactly one choice active', () => {
    const chips = renderEnumEditor(enumField(6), 'option-3');
    expect(chips.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(chips).toContain('role="radiogroup"');
  });

  // Changed deliberately: this used to assert that a value outside the derived
  // set showed as no selection at all. The derived set is what has been SEEN,
  // not what is allowed, so hiding the record's own value made a field that
  // holds something read as empty — and made a value entered through the
  // escape hatch vanish the moment it was written.
  it('shows a value the option list has never seen, and marks it active', () => {
    const markup = renderEnumEditor(enumField(6), 'nothing-like-it');
    expect(markup).toContain('nothing-like-it');
    expect(markup.match(/aria-checked="true"/g)).toHaveLength(1);
  });

  it('lets a chip be un-picked only where the schema allows absence', () => {
    const written: unknown[] = [];
    const chipHandler = (optional: boolean): ((selected: readonly string[]) => void) => {
      const kit = resolveFieldKit('enum');
      if (!kit) throw new Error('no enum kit registered');
      const element = kit.EditorControl({
        field: { ...enumField(6), optional },
        value: 'option-3',
        onChange: (next) => written.push(next),
      });
      return pickerOf<{ onChange: (selected: readonly string[]) => void }>(element).props.onChange;
    };

    chipHandler(false)([]);
    expect(written).toEqual([]);
    chipHandler(true)([]);
    expect(written).toEqual(['']);
    chipHandler(false)(['option-5']);
    expect(written).toEqual(['', 'option-5']);
  });

  it('renders an absent value without throwing, at every tier', () => {
    for (const count of [3, 7, ENUM_MAX + 1]) {
      expect(() => renderEnumEditor(enumField(count), undefined), `${count} options`).not.toThrow();
    }
  });

  it('renders the segmented tier for an optional field, with a value and with none', () => {
    const optionalField: FieldDescriptor = { ...enumField(3), optional: true };
    expect(() => renderEnumEditor(optionalField, 'option-2')).not.toThrow();
    expect(() => renderEnumEditor(optionalField, undefined)).not.toThrow();
    expect(controlOf(renderEnumEditor(optionalField, 'option-2'))).toBe('segmented');
  });

  it('wires the segmented tier a deselect handler only where the schema allows absence', () => {
    const segmentedElement = (optional: boolean): { props: { onDeselect?: () => void } } => {
      const kit = resolveFieldKit('enum');
      if (!kit) throw new Error('no enum kit registered');
      return pickerOf<{ onDeselect?: () => void }>(kit.EditorControl({
        field: { ...enumField(3), optional },
        value: 'option-2',
        onChange: () => undefined,
      }));
    };

    expect(segmentedElement(false).props.onDeselect).toBeUndefined();
    expect(segmentedElement(true).props.onDeselect).toBeTypeOf('function');
  });

  it('clears the value through onChange(\'\') when the deselect handler fires', () => {
    const written: unknown[] = [];
    const kit = resolveFieldKit('enum');
    if (!kit) throw new Error('no enum kit registered');
    const picker = pickerOf<{ onDeselect?: () => void }>(kit.EditorControl({
      field: { ...enumField(3), optional: true },
      value: 'option-2',
      onChange: (next) => written.push(next),
    }));
    picker.props.onDeselect?.();
    expect(written).toEqual(['']);
  });
});

describe('enum editor — against real derived schemas', () => {
  const kindOfField = (rows: readonly unknown[], path: string): string => {
    const field = buildSchema(rows).find((entry) => entry.path === path);
    if (!field) throw new Error(`no field at ${path}`);
    return controlOf(renderEnumEditor(field, ''));
  };

  it('gives a three-way classification a segmented track', () => {
    expect(kindOfField(all('screen'), 'kind')).toBe('segmented');
  });

  it('gives a nine-way classification chips', () => {
    expect(kindOfField(all('item'), 'category')).toBe('chips');
  });
});

describe('a list of closed-set values edits as one chip row, not as rows', () => {
  const rows = [
    { id: 'sample-1', marks: ['alpha'] },
    { id: 'sample-2', marks: ['beta', 'gamma'] },
    { id: 'sample-3', marks: ['alpha', 'delta'] },
  ];

  const render = (record: unknown): string =>
    renderToStaticMarkup(createElement(RecordEditor, {
      record, schema: buildSchema(rows), onSave: async () => undefined,
    }));

  it('drops the per-element rows in favour of the whole set at once', () => {
    const markup = render(rows[1]);
    expect(markup).toContain(CHIPS);
    expect(markup).not.toContain('aria-label="Move up"');
    expect(markup).not.toContain('+ Add');
  });

  it('shows every value in the set, with the held ones marked', () => {
    const markup = render(rows[1]);
    for (const option of ['alpha', 'beta', 'gamma', 'delta']) expect(markup).toContain(option);
    expect(markup.match(/tag-picker__tag--active/g)).toHaveLength(2);
  });

  it('keeps the rows for a list of free text, where order and new values matter', () => {
    const freeText = all('screen');
    const markup = renderToStaticMarkup(createElement(RecordEditor, {
      record: freeText.find((row) => (row.tags?.length ?? 0) > 0) ?? freeText[0],
      schema: buildSchema(freeText),
      onSave: async () => undefined,
    }));
    expect(markup).toContain('aria-label="Move up"');
    expect(markup).toContain('+ Add');
  });
});

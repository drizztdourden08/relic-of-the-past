/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { RecordEditor } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

// A requirement expression's `anyOf`/`allOf` is an ARRAY OF A UNION — each
// entry is one of several branches (own an item, own a check, own N of a
// group, nest another anyOf/allOf, or the impossible sentinel), which is the
// shape `ObjectArrayEditor` cannot serve (its elements are one fixed shape)
// and `array-kit`'s read-only fallback used to be the only thing offered.
//
// SSR smoke tests over a synthetic fixture, matching the house style for the
// object-array editor: they prove branch-aware rows render and the list
// plumbing (add/remove/branch picker) is present. Clicking add, switching a
// branch or dragging need a browser and are NOT covered here.

const ITEM_BRANCH: FieldDescriptor = {
  path: 'anyOf[].itemId', label: 'Item id', kind: 'idRef', optional: true, targetKind: 'item',
};
const CHECK_BRANCH: FieldDescriptor = {
  path: 'anyOf[].checkId', label: 'Check id', kind: 'idRef', optional: true, targetKind: 'check',
};
const COUNT_BRANCH: FieldDescriptor = {
  path: 'anyOf[].count', label: 'Count', kind: 'object', optional: true,
  children: [
    { path: 'anyOf[].count.groupId', label: 'Group id', kind: 'idRef', optional: false, targetKind: 'item-group' },
    { path: 'anyOf[].count.n', label: 'N', kind: 'number', optional: false },
  ],
};

const REQUIREMENT_ELEMENT: FieldDescriptor = {
  path: 'anyOf[]', label: 'Any of item', kind: 'union', optional: false,
  children: [ITEM_BRANCH, CHECK_BRANCH, COUNT_BRANCH],
};

const ANY_OF_FIELD: FieldDescriptor = {
  path: 'anyOf', label: 'Any of', kind: 'array', optional: true, of: REQUIREMENT_ELEMENT,
};

const record = {
  anyOf: [
    { itemId: 'item-001' },
    { count: { groupId: 'ig-001', n: 3 } },
  ],
};

const render = (rec: unknown): string =>
  renderToStaticMarkup(createElement(RecordEditor, {
    record: rec,
    schema: [ANY_OF_FIELD],
    onSave: async () => undefined,
  }));

describeDataset('a list of variant requirements gets a branch-aware editor', () => {
  it('opens each element as its own form, not the read-only count fallback', () => {
    const markup = render(record);
    expect(markup).toContain('record-editor__array-item');
    expect(markup).not.toContain('field-kit__text');
  });

  it('shows only the matched branch\'s own fields for each element', () => {
    const markup = render(record);
    expect(markup).toContain('Item id');
    expect(markup).toContain('Group id');
    expect(markup).toContain('>N<');
    // The sibling branch never shown for either element.
    expect(markup).not.toContain('Check id');
  });

  it('offers a shape picker per element, with every branch as an option', () => {
    const markup = render(record);
    expect(markup.match(/select-trigger/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('keeps add and remove, exactly as the other list editors have them', () => {
    const markup = render(record);
    expect(markup).toContain('aria-label="Remove"');
    expect(markup).toContain('+ Add');
  });

  it('shows a picker with no rows for an element whose branch cannot be resolved', () => {
    const markup = render({ anyOf: [{}] });
    expect(markup).toContain('Choose a shape for this item.');
  });

  it('renders an empty list with no elements at all', () => {
    const markup = render({ anyOf: [] });
    expect(markup).toContain('none');
    expect(markup).toContain('+ Add');
  });

  it('recurses into a nested anyOf/allOf branch through the same routing', () => {
    const nestedField: FieldDescriptor = {
      path: 'anyOf', label: 'Any of', kind: 'array', optional: true,
      of: {
        path: 'anyOf[]', label: 'Any of item', kind: 'union', optional: false,
        children: [
          ITEM_BRANCH,
          {
            path: 'anyOf[].allOf', label: 'All of', kind: 'array', optional: true,
            of: { ...REQUIREMENT_ELEMENT, path: 'anyOf[].allOf[]' },
          },
        ],
      },
    };
    const nested = { anyOf: [{ allOf: [{ itemId: 'item-002' }] }] };
    const markup = renderToStaticMarkup(createElement(RecordEditor, {
      record: nested, schema: [nestedField], onSave: async () => undefined,
    }));
    expect(markup).toContain('All of');
    expect(markup).toContain('Item id');
  });
});

describeDataset('the real dataset actually derives this shape', () => {
  it('a requirement expression is a union in the live schema', () => {
    const field = buildSchema(all('check')).find((entry) => entry.path === 'requirements');
    expect(field?.kind).toBe('union');
  });
});

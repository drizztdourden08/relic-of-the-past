/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RecordEditor } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';

// A requirement SET (`RequirementSet = TraversalRequirement[][]` in
// nav-data.types.ts) is an OR-of-AND list: an array whose element is ITSELF an
// array of strings, one level deeper than `ArrayFieldEditor` serves. The
// `array-kit` read-only fallback used to be all that was offered.

const REQUIREMENT_STRING: FieldDescriptor = {
  path: 'requirements[][]', label: 'Requirements item item', kind: 'string', optional: false,
};

const REQUIREMENTS_FIELD: FieldDescriptor = {
  path: 'requirements',
  label: 'Requirements',
  kind: 'array',
  optional: true,
  of: {
    path: 'requirements[]', label: 'Requirements item', kind: 'array', optional: false, of: REQUIREMENT_STRING,
  },
};

const render = (record: unknown): string =>
  renderToStaticMarkup(createElement(RecordEditor, {
    record,
    schema: [REQUIREMENTS_FIELD],
    onSave: async () => undefined,
  }));

describe('an OR-of-AND requirement set gets a nested list editor', () => {
  const record = { requirements: [['sword'], ['boomerang', 'bombs']] };

  it('opens each outer entry as its own group instead of the read-only count', () => {
    const markup = render(record);
    expect(markup).toContain('record-editor__array-item');
    expect(markup).not.toContain('field-kit__text');
  });

  it('shows one inner value control per entry, at both levels', () => {
    const markup = render(record);
    expect(markup).toContain(`value="sword"`);
    expect(markup).toContain(`value="boomerang"`);
    expect(markup).toContain(`value="bombs"`);
  });

  it('offers add at both the outer and inner level', () => {
    const markup = render(record);
    expect(markup).toContain('+ Add group');
    expect(markup).toContain('+ Add value');
  });

  it('offers remove at both levels', () => {
    const markup = render(record);
    expect(markup.match(/aria-label="Remove"/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it('renders an empty outer list with nothing to remove yet', () => {
    const markup = render({ requirements: [] });
    expect(markup).toContain('none');
    expect(markup).toContain('+ Add group');
    expect(markup).not.toContain('+ Add value');
  });

  it('renders an inner empty group with nothing in it yet', () => {
    const markup = render({ requirements: [[]] });
    expect(markup).toContain('+ Add value');
  });

  it('renders every real-shaped combination without throwing', () => {
    const shapes = [
      { requirements: [] },
      { requirements: [[]] },
      { requirements: [['lift.1']] },
      { requirements: [['sword'], ['boomerang']] },
      { requirements: [['hammer', 'lift.1']] },
    ];
    for (const shape of shapes) expect(() => render(shape)).not.toThrow();
  });
});

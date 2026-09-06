/* @layer tests @kind test */
/**
 * The escape hatch every enum editor carries. Kind inference derives `options`
 * from the values a collection holds, so a field only ever written one way,
 * that the schema calls non-optional, leaves a picker with one segment that
 * cannot be changed or cleared. These cover the way out.
 *
 * SSR smoke tests (no jsdom): both states of the entry are rendered directly,
 * the decisions behind them as plain functions.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { resolveFieldKit } from '../../apps/web/src/ui/design-system/composites/field-kits';
import { committedValue, withCurrentValue } from '../../apps/web/src/ui/design-system/composites/field-kits/open-set';
import { OpenSetControl } from '../../apps/web/src/ui/design-system/composites/field-kits/sub-components/OpenSetControl';
import { OpenSetEntry } from '../../apps/web/src/ui/design-system/composites/field-kits/sub-components/OpenSetEntry';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

const TOGGLE = '+ Other';

const kit = () => {
  const resolved = resolveFieldKit('enum');
  if (!resolved) throw new Error('no enum kit registered');
  return resolved;
};

/** The schema is a tree, and two of the fields under test are nested. */
const flatten = (fields: readonly FieldDescriptor[]): readonly FieldDescriptor[] =>
  fields.flatMap((entry) => [entry, ...flatten(entry.children ?? [])]);

const fieldAt = (rows: readonly unknown[], path: string): FieldDescriptor => {
  const found = flatten(buildSchema(rows)).find((entry) => entry.path === path);
  if (!found) throw new Error(`no field at ${path}`);
  return found;
};

const renderEditor = (field: FieldDescriptor, value: unknown): string =>
  renderToStaticMarkup(createElement(kit().EditorControl, {
    field, value, onChange: () => undefined,
  }));

/** The decorator's `onSubmit`, which is what the entry writes through when applied. */
const submitOf = (field: FieldDescriptor, value: unknown, onChange: (next: unknown) => void) =>
  (kit().EditorControl({ field, value, onChange }) as unknown as {
    props: { onSubmit: (next: string) => void };
  }).props.onSubmit;

describeDataset('the option set a control offers', () => {
  it('adds the value this record holds when inference never saw it', () => {
    expect(withCurrentValue(['mapped'], 'verified')).toEqual(['mapped', 'verified']);
  });

  it('leaves an already-known value, and an absent one, alone', () => {
    expect(withCurrentValue(['mapped'], 'mapped')).toEqual(['mapped']);
    expect(withCurrentValue(['mapped'], '')).toEqual(['mapped']);
  });
});

describeDataset('what an entry commits to', () => {
  it('writes a trimmed value that differs from the one held', () => {
    expect(committedValue('  verified  ', 'mapped')).toBe('verified');
  });

  it('writes nothing for a blank entry or one that repeats what is held', () => {
    expect(committedValue('   ', 'mapped')).toBeUndefined();
    expect(committedValue('mapped', 'mapped')).toBeUndefined();
    expect(committedValue('', '')).toBeUndefined();
  });
});

describeDataset('the entry renders in both of its states', () => {
  const decorated = (disabled?: boolean): string =>
    renderToStaticMarkup(createElement(OpenSetControl, {
      current: 'mapped', label: 'Status', disabled, onSubmit: () => undefined,
      children: null,
    }));

  it('starts closed, offering only the toggle', () => {
    const markup = decorated();
    expect(markup).toContain(TOGGLE);
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).not.toContain('aria-label="Status: a value that is not listed"');
  });

  it('disables the toggle where the whole editor is read-only', () => {
    expect(decorated(true)).toContain('disabled');
  });

  it('renders a box and an apply button once open', () => {
    const markup = renderToStaticMarkup(createElement(OpenSetEntry, {
      draft: 'verified', label: 'Status', onDraft: () => undefined, onCommit: () => undefined,
    }));
    expect(markup).toContain('value="verified"');
    expect(markup).toContain('aria-label="Status: a value that is not listed"');
    expect(markup).toContain('Set');
  });
});

describeDataset('a field the dataset has only ever written one way', () => {
  const screens = all('screen');

  // The premise, asserted: if this ever grows a second value, the dead end this
  // fix addresses stops being reproducible here. (`status` was the other
  // example before it was retired with `ScreenRecord.status`.)
  it('is a single-option, non-optional enum today', () => {
    const field = fieldAt(screens, 'variant.key');
    expect(field.kind).toBe('enum');
    expect(field.optional).toBe(false);
    expect(field.options).toHaveLength(1);
  });

  it('offers a way out of its one option', () => {
    expect(renderEditor(fieldAt(screens, 'variant.key'), '')).toContain(TOGGLE);
  });

  it('writes a value nobody has used before straight to the field', () => {
    const written: unknown[] = [];
    submitOf(fieldAt(screens, 'variant.key'), 'the-only-key', (next) => written.push(next))('a-new-key');
    expect(written).toEqual(['a-new-key']);
  });

  it('shows that new value as the active choice instead of losing it', () => {
    const markup = renderEditor(fieldAt(screens, 'variant.key'), 'a-new-key');
    expect(markup).toContain('a-new-key');
    expect(markup.match(/aria-checked="true"/g)).toHaveLength(1);
  });
});

describeDataset('a multi-option enum keeps what it already had', () => {
  const optionalMulti = fieldAt(all('screen'), 'interiorKind');
  const requiredMulti = fieldAt(all('connection'), 'kind');

  it('is the multi-option, optional field this guards', () => {
    expect(optionalMulti.optional).toBe(true);
    expect((optionalMulti.options ?? []).length).toBeGreaterThan(1);
  });

  it('still clears through the picker where the schema allows absence', () => {
    const written: unknown[] = [];
    const picker = kit().EditorControl({
      field: optionalMulti, value: 'shop', onChange: (next) => written.push(next),
    }) as unknown as { props: { children: { props: { onChange: (v: readonly string[]) => void } } } };
    picker.props.children.props.onChange([]);
    expect(written).toEqual(['']);
  });

  it('refuses to clear a required field through the picker, hatch or no hatch', () => {
    const written: unknown[] = [];
    const picker = kit().EditorControl({
      field: requiredMulti, value: 'door', onChange: (next) => written.push(next),
    }) as unknown as { props: { children: { props: { onDeselect?: () => void } } } };
    expect(picker.props.children.props.onDeselect).toBeUndefined();
    expect(written).toEqual([]);
  });

  it('carries the same escape hatch, since its options are derived too', () => {
    expect(renderEditor(optionalMulti, 'shop')).toContain(TOGGLE);
    expect(renderEditor(requiredMulti, 'door')).toContain(TOGGLE);
  });
});

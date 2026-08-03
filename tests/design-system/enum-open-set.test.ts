/* @layer tests @kind test */
/**
 * The escape hatch every enum editor carries.
 *
 * Kind inference derives `options` from the values a collection happens to
 * hold, so a closed-set control can only ever re-offer the past. On a field
 * that has only ever been written one way — and that the schema calls
 * non-optional — that leaves a picker with one segment, already active, that
 * cannot be changed and cannot be cleared. These cover the way out.
 *
 * SSR smoke tests, as everywhere else in this folder: there is no jsdom here,
 * so the toggle cannot be clicked and the box cannot be typed into. Both
 * states of the entry are rendered directly and the decisions behind them are
 * covered as the plain functions they were extracted into.
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

/** The decorator's `onSubmit` — what the entry writes through when applied. */
const submitOf = (field: FieldDescriptor, value: unknown, onChange: (next: unknown) => void) =>
  (kit().EditorControl({ field, value, onChange }) as unknown as {
    props: { onSubmit: (next: string) => void };
  }).props.onSubmit;

describe('the option set a control offers', () => {
  it('adds the value this record holds when inference never saw it', () => {
    expect(withCurrentValue(['mapped'], 'verified')).toEqual(['mapped', 'verified']);
  });

  it('leaves an already-known value, and an absent one, alone', () => {
    expect(withCurrentValue(['mapped'], 'mapped')).toEqual(['mapped']);
    expect(withCurrentValue(['mapped'], '')).toEqual(['mapped']);
  });
});

describe('what an entry commits to', () => {
  it('writes a trimmed value that differs from the one held', () => {
    expect(committedValue('  verified  ', 'mapped')).toBe('verified');
  });

  it('writes nothing for a blank entry or one that repeats what is held', () => {
    expect(committedValue('   ', 'mapped')).toBeUndefined();
    expect(committedValue('mapped', 'mapped')).toBeUndefined();
    expect(committedValue('', '')).toBeUndefined();
  });
});

describe('the entry renders in both of its states', () => {
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

describe('a field the dataset has only ever written one way', () => {
  const screens = all('screen');

  // The premise, asserted rather than assumed: if either of these ever grows a
  // second value the dead end this fix addresses stops being reproducible here.
  it('is a single-option, non-optional enum today', () => {
    for (const path of ['status', 'variant.key']) {
      const field = fieldAt(screens, path);
      expect(field.kind, path).toBe('enum');
      expect(field.optional, path).toBe(false);
      expect(field.options, path).toHaveLength(1);
    }
  });

  it('offers a way out of its one option', () => {
    for (const path of ['status', 'variant.key']) {
      expect(renderEditor(fieldAt(screens, path), ''), path).toContain(TOGGLE);
    }
  });

  it('writes a value nobody has used before straight to the field', () => {
    const written: unknown[] = [];
    submitOf(fieldAt(screens, 'status'), 'mapped', (next) => written.push(next))('verified');
    expect(written).toEqual(['verified']);
  });

  it('shows that new value as the active choice instead of losing it', () => {
    const markup = renderEditor(fieldAt(screens, 'status'), 'verified');
    expect(markup).toContain('verified');
    expect(markup.match(/aria-checked="true"/g)).toHaveLength(1);
  });
});

describe('a genuinely multi-option enum keeps what it already had', () => {
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

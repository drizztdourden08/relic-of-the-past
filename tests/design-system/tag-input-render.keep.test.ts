/* @layer tests @kind test */
/**
 * SSR smoke tests (no jsdom): the control renders empty, holding chips, and
 * disabled. The portal panel (reads `document`), typing and keys need a
 * browser; their rules are covered in tag-input-values.test.ts.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TagInput } from '../../apps/web/src/ui/design-system/primitives/TagInput';
import type { TagInputProps } from '../../apps/web/src/ui/design-system/primitives/TagInput';

const VOCABULARY = ['env:outdoor', 'role:boss', 'hazard:pits'];

const render = (props: Partial<TagInputProps> = {}): string =>
  renderToStaticMarkup(createElement(TagInput, {
    value: [],
    onChange: () => undefined,
    suggestions: VOCABULARY,
    ...props,
  }));

describe('TagInput in the empty state', () => {
  it('renders the field and an entry, with no chips', () => {
    const markup = render({ placeholder: 'Add a tag...' });
    expect(markup).toContain('tag-input__field');
    expect(markup).toContain('tag-input__entry');
    expect(markup).not.toContain('tag-input__chip');
  });

  it('shows the placeholder only while there is nothing applied', () => {
    expect(render({ placeholder: 'Add a tag...' })).toContain('placeholder="Add a tag..."');
    expect(render({ placeholder: 'Add a tag...', value: ['env:outdoor'] }))
      .not.toContain('placeholder="Add a tag..."');
  });

  it('is a closed combobox until something opens it', () => {
    const markup = render();
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).not.toContain('tag-input__panel');
  });

  it('ties an optional label to the entry', () => {
    const markup = render({ label: 'Tags', id: 'sample-tags' });
    expect(markup).toContain('for="sample-tags"');
    expect(markup).toContain('id="sample-tags"');
    expect(markup).toContain('>Tags</label>');
  });
});

describe('TagInput holding several chips', () => {
  const value = ['env:outdoor', 'role:boss', 'hazard:pits'];

  it('renders one removable chip per value, in order', () => {
    const markup = render({ value });
    for (const tag of value) {
      expect(markup).toContain(`aria-label="Remove ${tag}"`);
    }
    expect(markup.indexOf('env:outdoor')).toBeLessThan(markup.indexOf('role:boss'));
  });

  it('builds each chip on the Badge primitive', () => {
    const markup = render({ value });
    expect(markup).toContain('badge badge--neutral tag-input__chip');
  });

  it('flags a chip that breaks the convention, and leaves the rest alone', () => {
    const markup = render({ value: ['env:outdoor', 'lonely'] });
    expect(markup).toContain('tag-input__chip--off-convention');
    expect(markup).toContain('>lonely</span>');
    // One flag for the one offender, not for the well-formed neighbour.
    expect(markup.match(/tag-input__chip--off-convention/g)).toHaveLength(1);
  });

  it('takes a caller\'s validator over the built-in one', () => {
    const lowercaseOnly = (raw: string) => /^[a-z:-]+$/.test(raw);
    expect(render({ value: ['Env:Outdoor'], validate: lowercaseOnly }))
      .toContain('tag-input__chip--off-convention');
    expect(render({ value: ['Env:Outdoor'] }))
      .not.toContain('tag-input__chip--off-convention');
  });
});

describe('TagInput when disabled', () => {
  const markup = render({ value: ['env:outdoor', 'role:boss'], disabled: true });

  it('marks the root and disables the entry', () => {
    expect(markup).toContain('tag-input--disabled');
    expect(markup).toContain('disabled=""');
  });

  it('disables every chip\'s remove button too', () => {
    expect(markup.match(/disabled=""/g)).toHaveLength(3);
    expect(markup).toContain('tabindex="-1"');
  });

  it('keeps the panel shut', () => {
    expect(markup).not.toContain('tag-input__panel');
  });
});

describe('TagInput rendering does not throw on the awkward inputs', () => {
  it('takes no suggestions at all', () => {
    expect(() => render({ suggestions: undefined })).not.toThrow();
  });

  it('takes a value holding entries no vocabulary knows', () => {
    expect(() => render({ value: ['made:up', 'lonely', 'ns:with spaces'] })).not.toThrow();
  });

  it('renders every value in a vocabulary as a chip without throwing', () => {
    for (const tag of VOCABULARY) {
      expect(() => render({ value: [tag] }), tag).not.toThrow();
    }
  });
});

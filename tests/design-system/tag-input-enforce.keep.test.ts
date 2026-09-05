/* @layer tests @kind test */
/**
 * The one field that REFUSES a value, and every field that still does not.
 * Enforcement exists for a single case: a tag list whose values are references,
 * where inventing a term means minting a record. Everywhere else stays advisory;
 * an opt-in that silently became the default would break every other tag entry.
 *
 * No jsdom, so the decision a keystroke resolves to is covered as a pure function.
 */
import { describe, it, expect } from 'vitest';
import {
  adviseTag, blocksCreate,
} from '../../apps/web/src/ui/design-system/primitives/TagInput/behavior/tag-convention';
import { isNewValue } from '../../apps/web/src/ui/design-system/primitives/TagInput/behavior/tag-values';
import {
  isReferencedTagList, isTagsField,
} from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';

const VOCABULARY = ['env:outdoor', 'role:boss', 'legacy-untagged'] as const;

const decide = (raw: string, enforce: boolean): boolean =>
  blocksCreate({ raw, isNew: isNewValue(raw, VOCABULARY), enforce });

describe('an enforcing entry', () => {
  it('refuses a brand-new value with no separator', () => {
    expect(decide('outdoor', true)).toBe(true);
  });

  it('refuses one with nothing before or after the separator', () => {
    expect(decide(':outdoor', true)).toBe(true);
    expect(decide('env:', true)).toBe(true);
  });

  it('accepts a brand-new value that reads namespace:value', () => {
    expect(decide('env:cavern', true)).toBe(false);
  });

  it('never refuses a value the vocabulary already holds, convention or not', () => {
    expect(decide('env:outdoor', true)).toBe(false);
    expect(decide('legacy-untagged', true)).toBe(false);
    // Case is not what makes it new, because the entry resolves to the existing value.
    expect(decide('LEGACY-UNTAGGED', true)).toBe(false);
  });

  it('has nothing to refuse when nothing has been typed', () => {
    expect(decide('', true)).toBe(false);
  });

  it('defers to a caller-supplied check instead of the built-in one', () => {
    const onlyEnv = (raw: string): boolean => raw.startsWith('env:');
    expect(blocksCreate({ raw: 'role:new', isNew: true, enforce: true, validate: onlyEnv })).toBe(true);
    expect(blocksCreate({ raw: 'env:new', isNew: true, enforce: true, validate: onlyEnv })).toBe(false);
  });
});

describe('every entry that is not enforcing', () => {
  it('commits a value that fails the convention, exactly as before', () => {
    expect(decide('outdoor', false)).toBe(false);
    expect(decide('env:', false)).toBe(false);
    expect(decide('', false)).toBe(false);
  });

  it('still SAYS the value is off-convention, because the advice never went away', () => {
    expect(adviseTag('outdoor').ok).toBe(false);
    expect(adviseTag('outdoor').message).not.toBeNull();
    expect(adviseTag('env:outdoor').ok).toBe(true);
  });
});

describe('which tag lists enforce', () => {
  const list = (elementKind: FieldDescriptor['kind'], targetKind?: string): FieldDescriptor => ({
    path: 'tags', label: 'Tags', kind: 'array', optional: false,
    of: { path: 'tags[]', label: 'Tags item', kind: elementKind, optional: false, targetKind },
  });

  it('a referenced list does, because a new term there is a new record', () => {
    const referenced = list('idRef', 'tag');
    expect(isTagsField(referenced)).toBe(true);
    expect(isReferencedTagList(referenced)).toBe(true);
  });

  it('a plain list of strings does not', () => {
    const strings = list('string');
    expect(isTagsField(strings)).toBe(true);
    expect(isReferencedTagList(strings)).toBe(false);
  });
});

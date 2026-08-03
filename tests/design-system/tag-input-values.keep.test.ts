/* @layer tests @kind test */
/**
 * The TagInput's decisions, tested where they live: as plain functions.
 *
 * There is no jsdom or testing-library in this repo, so the keystrokes
 * themselves cannot be dispatched. Every rule a keystroke resolves to IS
 * covered here — what Enter commits, what Backspace removes, what the panel
 * offers — and the wiring from key to rule is the one line each case that a
 * browser would have to confirm.
 */
import { describe, it, expect } from 'vitest';
import {
  addTag,
  filterSuggestions,
  isNewValue,
  normalizeTag,
  removeAt,
  removeLast,
  resolveCommit,
} from '../../apps/web/src/ui/design-system/primitives/TagInput/behavior/tag-values';
import {
  adviseTag,
  followsConvention,
} from '../../apps/web/src/ui/design-system/primitives/TagInput/behavior/tag-convention';

const VOCABULARY = [
  'env:outdoor',
  'env:indoor',
  'role:boss',
  'role:pre-boss',
  'hazard:pits',
  'dir:two-way',
] as const;

const filter = (query: string, selected: readonly string[] = [], limit?: number) =>
  filterSuggestions({ suggestions: VOCABULARY, query, selected, limit });

describe('filterSuggestions — searching what already exists', () => {
  it('offers everything when nothing has been typed', () => {
    expect(filter('')).toEqual([...VOCABULARY]);
  });

  it('matches on a substring anywhere in the value, not just the start', () => {
    expect(filter('boss')).toEqual(['role:boss', 'role:pre-boss']);
    expect(filter('pre')).toEqual(['role:pre-boss']);
  });

  it('matches case-insensitively, in both directions', () => {
    expect(filter('ENV')).toEqual(['env:outdoor', 'env:indoor']);
    expect(filter('OuTdOoR')).toEqual(['env:outdoor']);
  });

  it('searches the namespace half as readily as the value half', () => {
    expect(filter('hazard:')).toEqual(['hazard:pits']);
  });

  it('ignores surrounding whitespace in the query', () => {
    expect(filter('  pits  ')).toEqual(['hazard:pits']);
  });

  it('drops values that are already applied', () => {
    expect(filter('env', ['env:outdoor'])).toEqual(['env:indoor']);
    expect(filter('', ['env:outdoor', 'role:boss'])).toEqual([
      'env:indoor', 'role:pre-boss', 'hazard:pits', 'dir:two-way',
    ]);
  });

  it('returns nothing when the query matches nothing', () => {
    expect(filter('nothing-like-this')).toEqual([]);
  });

  it('honours the row cap', () => {
    expect(filter('', [], 2)).toEqual(['env:outdoor', 'env:indoor']);
    expect(filter('', [], 0)).toEqual([]);
  });
});

describe('isNewValue — is the typed text something the vocabulary lacks', () => {
  it('is false for a value already on offer, whatever the casing', () => {
    expect(isNewValue('env:outdoor', VOCABULARY)).toBe(false);
    expect(isNewValue('ENV:OUTDOOR', VOCABULARY)).toBe(false);
    expect(isNewValue('  role:boss  ', VOCABULARY)).toBe(false);
  });

  it('is true for text nobody has used yet', () => {
    expect(isNewValue('ctx:entrance', VOCABULARY)).toBe(true);
  });

  it('is false for nothing typed at all', () => {
    expect(isNewValue('', VOCABULARY)).toBe(false);
    expect(isNewValue('   ', VOCABULARY)).toBe(false);
  });
});

describe('resolveCommit — what Enter on the raw text actually adds', () => {
  it('creates the trimmed text when it matches no existing value', () => {
    expect(resolveCommit('  ctx:entrance  ', VOCABULARY)).toBe('ctx:entrance');
  });

  it('folds onto the existing value when the two differ only in case', () => {
    expect(resolveCommit('Env:Outdoor', VOCABULARY)).toBe('env:outdoor');
  });

  it('creates a value that breaks the convention just the same', () => {
    expect(resolveCommit('lonely', VOCABULARY)).toBe('lonely');
  });

  it('refuses to resolve an empty entry', () => {
    expect(resolveCommit('', VOCABULARY)).toBeNull();
    expect(resolveCommit('   ', VOCABULARY)).toBeNull();
  });
});

describe('addTag — appending, and the two things it declines to do', () => {
  it('appends to the end and leaves the original alone', () => {
    const value = ['env:outdoor'];
    expect(addTag(value, 'role:boss')).toEqual(['env:outdoor', 'role:boss']);
    expect(value).toEqual(['env:outdoor']);
  });

  it('trims before it adds', () => {
    expect(addTag([], '  role:boss ')).toEqual(['role:boss']);
  });

  it('hands back the same array for a duplicate, so the caller can tell', () => {
    const value = ['env:outdoor'];
    expect(addTag(value, 'env:outdoor')).toBe(value);
    expect(addTag(value, '  env:outdoor  ')).toBe(value);
  });

  it('hands back the same array for an empty entry', () => {
    const value = ['env:outdoor'];
    expect(addTag(value, '')).toBe(value);
    expect(addTag(value, '    ')).toBe(value);
  });
});

describe('removeAt / removeLast — taking chips off', () => {
  it('removes the chip at an index', () => {
    expect(removeAt(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });

  it('ignores an index outside the list', () => {
    const value = ['a', 'b'];
    expect(removeAt(value, -1)).toBe(value);
    expect(removeAt(value, 2)).toBe(value);
  });

  it('drops the last chip — what Backspace on an empty entry does', () => {
    expect(removeLast(['env:outdoor', 'role:boss'])).toEqual(['env:outdoor']);
    expect(removeLast(['env:outdoor'])).toEqual([]);
  });

  it('has nothing to drop when there are no chips', () => {
    const empty: readonly string[] = [];
    expect(removeLast(empty)).toBe(empty);
  });
});

describe('normalizeTag', () => {
  it('is a trim, and nothing more — casing and inner spacing are the value', () => {
    expect(normalizeTag('  Env:Two Words  ')).toBe('Env:Two Words');
  });
});

describe('the convention check — advisory, never blocking', () => {
  it('accepts namespace:value', () => {
    expect(followsConvention('env:outdoor')).toBe(true);
    expect(followsConvention('role:pre-boss')).toBe(true);
  });

  it('rejects a value with no separator, or with an empty half', () => {
    expect(followsConvention('outdoor')).toBe(false);
    expect(followsConvention(':outdoor')).toBe(false);
    expect(followsConvention('env:')).toBe(false);
  });

  it('assumes no character set beyond the separator', () => {
    expect(followsConvention('SOME NS:Some Value 42')).toBe(true);
  });

  it('advises with wording when the default check fails', () => {
    const advice = adviseTag('outdoor');
    expect(advice.ok).toBe(false);
    expect(advice.message).toContain('namespace');
  });

  it('says nothing about an entry that fits', () => {
    expect(adviseTag('env:outdoor')).toEqual({ ok: true, message: null });
  });

  it('says nothing about an empty entry', () => {
    expect(adviseTag('   ')).toEqual({ ok: true, message: null });
  });

  it('lets a caller replace the check with a stricter one', () => {
    const lowercaseOnly = (raw: string) => /^[a-z]+:[a-z-]+$/.test(raw) || 'Lowercase only';
    expect(adviseTag('env:outdoor', lowercaseOnly).ok).toBe(true);
    expect(adviseTag('Env:Outdoor', lowercaseOnly)).toEqual({ ok: false, message: 'Lowercase only' });
  });

  it('accepts a bare false from a caller that has no wording to offer', () => {
    expect(adviseTag('anything', () => false)).toEqual({ ok: false, message: null });
  });

  it('never stops the value being added — that is addTag\'s call, and it says yes', () => {
    const strict = () => 'Not how we write tags';
    expect(adviseTag('lonely', strict).ok).toBe(false);
    expect(addTag([], 'lonely')).toEqual(['lonely']);
    expect(resolveCommit('lonely', VOCABULARY)).toBe('lonely');
  });
});

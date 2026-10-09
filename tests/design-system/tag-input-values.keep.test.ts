/* @layer tests @kind test */
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
import { VOCABULARY } from './tag-input.constants';

const filter = (query: string, selected: readonly string[] = [], limit?: number) =>
  filterSuggestions({ suggestions: VOCABULARY, query, selected, limit });

describe('filterSuggestions searches what already exists', () => {
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

describe('isNewValue asks whether the vocabulary lacks the typed text', () => {
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

describe('what resolveCommit adds when Enter lands on the raw text', () => {
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

describe('addTag appends, and declines two things', () => {
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

describe('removeAt / removeLast take chips off', () => {
  it('removes the chip at an index', () => {
    expect(removeAt(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });

  it('ignores an index outside the list', () => {
    const value = ['a', 'b'];
    expect(removeAt(value, -1)).toBe(value);
    expect(removeAt(value, 2)).toBe(value);
  });

  it('drops the last chip when Backspace lands on an empty entry', () => {
    expect(removeLast(['env:outdoor', 'role:boss'])).toEqual(['env:outdoor']);
    expect(removeLast(['env:outdoor'])).toEqual([]);
  });

  it('has nothing to drop when there are no chips', () => {
    const empty: readonly string[] = [];
    expect(removeLast(empty)).toBe(empty);
  });
});

describe('normalizeTag', () => {
  it('is a trim and nothing more, because casing and inner spacing are the value', () => {
    expect(normalizeTag('  Env:Two Words  ')).toBe('Env:Two Words');
  });
});

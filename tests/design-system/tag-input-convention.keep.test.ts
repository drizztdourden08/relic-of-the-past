/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { addTag, resolveCommit, adviseTag, followsConvention } from '@drizztdourden08/tessera/primitives';
import { VOCABULARY } from './tag-input.constants';

describe('the convention check is advisory, never blocking', () => {
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

  it('never stops the value being added, because that is addTag\'s call and it says yes', () => {
    const strict = () => 'Not how we write tags';
    expect(adviseTag('lonely', strict).ok).toBe(false);
    expect(addTag([], 'lonely')).toEqual(['lonely']);
    expect(resolveCommit('lonely', VOCABULARY)).toBe('lonely');
  });
});

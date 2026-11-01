/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import { publicAsset } from '@app/public-asset/public-asset';

describe('publicAsset', () => {
  it('joins BASE_URL with a clean path, stripping any leading slash or dot-slash', { tags: ['critical'] }, () => {
    const base = import.meta.env.BASE_URL;
    expect(publicAsset('buttons/xbox/a.svg')).toBe(`${base}buttons/xbox/a.svg`);
    expect(publicAsset('/buttons/xbox/a.svg')).toBe(`${base}buttons/xbox/a.svg`);
    expect(publicAsset('./buttons/xbox/a.svg')).toBe(`${base}buttons/xbox/a.svg`);
  });
});

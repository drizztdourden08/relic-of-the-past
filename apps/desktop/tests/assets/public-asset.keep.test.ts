/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import { publicAsset } from '@app/public-asset/public-asset';

describe('publicAsset', () => {
  it('joins BASE_URL with a clean path, stripping any leading slash or dot-slash', () => {
    const base = import.meta.env.BASE_URL;
    expect(publicAsset('buttons/xbox/a.svg')).toBe(`${base}buttons/xbox/a.svg`);
    expect(publicAsset('/buttons/xbox/a.svg')).toBe(`${base}buttons/xbox/a.svg`);
    expect(publicAsset('./buttons/xbox/a.svg')).toBe(`${base}buttons/xbox/a.svg`);
  });

  it('never produces a doubled separator', () => {
    expect(publicAsset('/buttons/x.svg')).not.toContain('//buttons');
  });
});

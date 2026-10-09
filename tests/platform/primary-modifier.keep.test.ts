/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { isPrimaryModifier, primaryModifierLabel } from '../../shared/platform';

const held = (ctrl: boolean, meta: boolean) => ({ ctrlKey: ctrl, metaKey: meta });

describe('isPrimaryModifier', () => {
  it('is Cmd, and only Cmd, on the Apple platforms', () => {
    expect(isPrimaryModifier(held(false, true), 'macos')).toBe(true);
    expect(isPrimaryModifier(held(true, false), 'macos')).toBe(false);
    expect(isPrimaryModifier(held(false, true), 'ios')).toBe(true);
    expect(isPrimaryModifier(held(true, false), 'ios')).toBe(false);
  });

  it('is Ctrl, and only Ctrl, everywhere else', () => {
    (['windows', 'linux', 'android'] as const).forEach((os) => {
      expect(isPrimaryModifier(held(true, false), os)).toBe(true);
      expect(isPrimaryModifier(held(false, true), os)).toBe(false);
    });
  });

  it('accepts either when the host does not know its own OS', () => {
    expect(isPrimaryModifier(held(true, false), 'unknown')).toBe(true);
    expect(isPrimaryModifier(held(false, true), 'unknown')).toBe(true);
    expect(isPrimaryModifier(held(false, true))).toBe(true);
    expect(isPrimaryModifier(held(false, false))).toBe(false);
  });

  it('labels itself with the key that actually works', () => {
    expect(primaryModifierLabel('macos')).toBe('Cmd');
    expect(primaryModifierLabel('windows')).toBe('Ctrl');
    expect(primaryModifierLabel('unknown')).toBe('Ctrl');
    expect(primaryModifierLabel()).toBe('Ctrl');
  });
});

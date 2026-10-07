/* @layer tests @kind test */
/**
 * THE PRIMARY MODIFIER, asked once instead of spelled inline.
 *
 * The replaced idiom `(e.ctrlKey || e.metaKey)` is right on a Mac,
 * right on Windows, and wrong about which key it MEANT everywhere. What it
 * cannot do is answer "is the primary modifier held right now", which is what a
 * gesture that switches intent per frame needs.
 *
 * Two claims worth pinning, because getting either wrong is a platform bug
 * nobody on the other platform can see:
 *
 *  1. On macOS the primary modifier is `Cmd` ALONE. A bare `Ctrl` there means
 *     something else entirely and must not count.
 *  2. An UNKNOWN OS accepts either, which is exactly what the inline idiom did.
 *     The web host reports `os: 'unknown'` (a browser has no `process.platform`
 *     to read), so guessing `Ctrl` would break the app in Safari on a Mac, and
 *     adopting this helper at an existing call site must change nothing until
 *     the host learns its own OS.
 */
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
      // The Windows key is an OS key, not this app's modifier.
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

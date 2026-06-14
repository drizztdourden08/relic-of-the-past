/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import { osFromProcess, detectHost } from '@shared/platform';

describe('osFromProcess', () => {
  it('maps Node platform strings to OsKind', () => {
    expect(osFromProcess('win32')).toBe('windows');
    expect(osFromProcess('darwin')).toBe('macos');
    expect(osFromProcess('linux')).toBe('linux');
  });

  it('falls back to unknown for unrecognized or missing values', () => {
    expect(osFromProcess('freebsd')).toBe('unknown');
    expect(osFromProcess(undefined)).toBe('unknown');
  });
});

describe('detectHost', () => {
  it('returns web when neither Capacitor nor window.api is present', () => {
    // vitest runs in the node environment, so there is no window global.
    expect(detectHost()).toBe('web');
  });
});

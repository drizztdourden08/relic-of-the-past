/* @layer renderer-components @kind test */
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, serializeToIni } from '@rotp/game-core';

describe('MSUL config', () => {
  it('keeps the host-managed MSUL mode out of the native INI', () => {
    const ini = serializeToIni({ ...DEFAULT_SETTINGS, enableMSU: 'msul' });
    expect(ini).toContain('EnableMSU = false');
    expect(ini).not.toContain('EnableMSU = msul');
  });

  it('preserves native MSU modes in the INI', () => {
    const ini = serializeToIni({ ...DEFAULT_SETTINGS, enableMSU: 'deluxe-opuz' });
    expect(ini).toContain('EnableMSU = deluxe-opuz');
  });
});

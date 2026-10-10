/* @layer tests @kind helper */
import { describe, it } from 'vitest';
import { loadedUsRom } from './loaded-us-rom';

const missingRomPlaceholder = (name: string): void => {
  describe.skip(name, () => {
    it('needs the US cartridge, so put one in assets/ or point ROTP_ROM at it', () => undefined);
  });
};

const describeRom = (loadedUsRom ? describe : missingRomPlaceholder) as typeof describe;

export { describeRom };

/* @layer bridge-wasm @kind logic */
import { decodeCredits, decodeEndingCaptions, decodeMenuText } from '@rotp/asset-extraction';
import { loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { defineStep } from './define-step';

const menuTextStep = defineStep<'menu-text'>((_input, { romBytes }) => {
  const rom = loadRomFromBuffer(Buffer.from(romBytes), true);
  return {
    language: rom.language,
    menu: decodeMenuText(rom, rom.language),
    credits: [...decodeCredits(rom), ...decodeEndingCaptions(rom)],
  };
});

export { menuTextStep };

/* @layer bridge-wasm @kind logic */
import { compileJapaneseGraphics, encodeJapaneseGraphicsPack } from '@rotp/asset-extraction';
import { loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { defineStep } from './define-step';

const japaneseGraphicsStep = defineStep<'japanese-graphics'>((_input, { romBytes }, report) => {
  const rom = loadRomFromBuffer(Buffer.from(romBytes), true);
  if (rom.language !== 'ja') return null;
  report.line('Reading the Japanese graphics...');
  return encodeJapaneseGraphicsPack(compileJapaneseGraphics(rom));
});

export { japaneseGraphicsStep };

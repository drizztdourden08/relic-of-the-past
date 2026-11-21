/* @layer bridge-wasm @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { compileJapaneseGraphics, encodeJapaneseGraphicsPack } from '@rotp/asset-extraction';
import { loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { defineStep } from './define-step';

const japaneseGraphicsStep = defineStep<'japanese-graphics'>((_input, { romBytes }, report) => {
  const rom = loadRomFromBuffer(Buffer.from(romBytes), true);
  if (rom.language !== 'ja') return null;
  report.line(msg('data-manager:jobs.line.readJapaneseGraphics'));
  return encodeJapaneseGraphicsPack(compileJapaneseGraphics(rom));
});

export { japaneseGraphicsStep };

/* @layer bridge-wasm @kind logic */
import { extractLangEntry } from '@rotp/asset-extraction';
import { loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { defineStep } from './define-step';

const languageStep = defineStep<'language'>((_input, { romBytes }, report) => {
  report.line('Decoding dialogue...');
  const rom = loadRomFromBuffer(Buffer.from(romBytes), true);
  const entry = extractLangEntry(rom, rom.language, 1);
  return {
    code: rom.language,
    description: rom.description,
    dialogue: `${entry.lines.map((l) => `${l.id}: ${l.content}`).join('\n')}\n`,
    fontData: new Uint8Array(entry.fontData),
    fontWidth: new Uint8Array(entry.fontWidth),
    glyphCount: entry.glyphCount,
    lineCount: entry.lineCount,
    encoder: entry.encoder,
    flags: entry.flags,
  };
});

export { languageStep };

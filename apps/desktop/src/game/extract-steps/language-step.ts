/* @layer bridge-wasm @kind logic */
import { loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { extractRomPack } from '@rotp/languages';
import { defineStep } from './define-step';

const languageStep = defineStep<'language'>((_input, { romBytes }, report) => {
  report.line('Decoding dialogue...');
  return extractRomPack(loadRomFromBuffer(Buffer.from(romBytes), true));
});

export { languageStep };

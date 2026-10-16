/* @layer bridge-wasm @kind logic */
import { extractSpriteBuffers } from '@rotp/asset-extraction';
import { loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { defineStep } from './define-step';

const spritesStep = defineStep<'sprites'>(({ defs }, { romBytes }, report) => {
  report.line('Extracting sprites...');
  return extractSpriteBuffers(loadRomFromBuffer(Buffer.from(romBytes)), defs);
});

export { spritesStep };

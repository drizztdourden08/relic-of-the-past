/* @layer bridge-wasm @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { extractSpriteBuffers } from '@rotp/asset-extraction';
import { loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { defineStep } from './define-step';

const spritesStep = defineStep<'sprites'>(({ defs }, { romBytes }, report) => {
  report.line(msg('data-manager:jobs.line.extractSprites'));
  return extractSpriteBuffers(loadRomFromBuffer(Buffer.from(romBytes), true), defs);
});

export { spritesStep };

/* @layer bridge-wasm @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { extractRomPack } from '@rotp/languages';
import { defineStep } from './define-step';

const languageStep = defineStep<'language'>((_input, { romBytes }, report) => {
  report.line(msg('data-manager:jobs.line.decodeDialogue'));
  return extractRomPack(loadRomFromBuffer(Buffer.from(romBytes), true));
});

export { languageStep };

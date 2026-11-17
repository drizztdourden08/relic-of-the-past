/* @layer shared-asset-extraction @kind logic */
import type { LanguageConfig } from '../../data/language-data';
import type { StreamLayout } from './stream.type';

const streamLayout = (config: LanguageConfig, dictCount: number): StreamLayout => ({
  commandStart: config.commandStart,
  switchBank: config.switchBank,
  finish: config.finish,
  dictBase: config.dictBaseDec,
  dictCount,
  commandLengths: config.commandLengths,
  escape: config.escapeCharacter,
});

export { streamLayout };

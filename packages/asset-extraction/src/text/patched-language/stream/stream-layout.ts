/* @layer shared-asset-extraction @kind logic */
import type { LanguageConfig } from '../../data/language-data';
import { PT_MESSAGE_COUNT } from '../../dialogue-decoder/dialogue-decoder.constants';
import { STOPS_AFTER_COUNT } from './stream.constants';
import type { StreamLayout } from './stream.type';

const streamLayout = (config: LanguageConfig, dictCount: number): StreamLayout => ({
  commandStart: config.commandStart,
  switchBank: config.switchBank,
  finish: config.finish,
  dictBase: config.dictBaseDec,
  dictCount,
  commandLengths: config.commandLengths,
  escape: config.escapeCharacter,
  ignoresBankBytes: config.id === STOPS_AFTER_COUNT,
  stopAfter: config.id === STOPS_AFTER_COUNT ? PT_MESSAGE_COUNT : null,
});

export { streamLayout };

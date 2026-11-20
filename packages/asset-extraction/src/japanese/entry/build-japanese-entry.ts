/* @layer shared-asset-extraction @kind logic */
import { packArrays } from '../../asset-builder/pack-arrays';
import { US_MESSAGE_COUNT } from '../message-map/message-map.constants';
import { JAPANESE_TEXT_FLAG, NOT_US_ROM_FLAG } from '../text/core-encoding.constants';
import { encodeForCore } from '../text/encode-for-core';
import type { JapaneseEntryParams, JapanesePackedEntry } from './japanese-entry.type';
import { JAPANESE_RANDOMIZER_TEMPLATES } from './japanese-templates.constants';

// The font slot stays empty: the core draws a Japanese set's glyphs from the Japanese graphics pack
// (JaGraphics_DialogueFontSync), never from the asset blob.
const buildJapaneseEntry = ({ code, texts }: JapaneseEntryParams): JapanesePackedEntry => {
  if (texts.length !== US_MESSAGE_COUNT) {
    throw new Error(`buildJapaneseEntry: expected ${US_MESSAGE_COUNT} dialogue lines for "${code}", got ${texts.length}`);
  }
  const dialogue = [...texts, ...JAPANESE_RANDOMIZER_TEMPLATES].map((text) => Buffer.from(encodeForCore(text)));
  return {
    code,
    base: code,
    langData: packArrays([packArrays([Buffer.alloc(0)]), packArrays(dialogue)]),
    fontPacked: packArrays([Buffer.alloc(0), Buffer.alloc(0)]),
    flags: JAPANESE_TEXT_FLAG | NOT_US_ROM_FLAG,
  };
};

export { buildJapaneseEntry };

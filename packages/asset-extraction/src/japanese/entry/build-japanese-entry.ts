/* @layer shared-asset-extraction @kind logic */
import { packArrays } from '../../asset-builder/pack-arrays';
import { US_MESSAGE_COUNT } from '../message-map/message-map.constants';
import { JAPANESE_TEXT_FLAG, NOT_US_ROM_FLAG } from '../text/core-encoding.constants';
import { encodeForCore } from '../text/encode-for-core';
import type { JapaneseEntryParams, JapanesePackedEntry } from './japanese-entry.type';
import { JAPANESE_RANDOMIZER_TEMPLATES } from './japanese-templates.constants';

const buildJapaneseEntry = ({ code, texts, fontData, fontWidth }: JapaneseEntryParams): JapanesePackedEntry => {
  if (texts.length !== US_MESSAGE_COUNT) {
    throw new Error(`buildJapaneseEntry: expected ${US_MESSAGE_COUNT} dialogue lines for "${code}", got ${texts.length}`);
  }
  const dialogue = [...texts, ...JAPANESE_RANDOMIZER_TEMPLATES].map((text) => Buffer.from(encodeForCore(text)));
  return {
    code,
    base: code,
    langData: packArrays([packArrays([Buffer.alloc(0)]), packArrays(dialogue)]),
    fontPacked: packArrays([Buffer.from(fontData), Buffer.from(fontWidth)]),
    flags: JAPANESE_TEXT_FLAG | NOT_US_ROM_FLAG,
  };
};

export { buildJapaneseEntry };

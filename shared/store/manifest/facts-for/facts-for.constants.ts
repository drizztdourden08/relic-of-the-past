/* @layer shared-store @kind constants */
import type { Container, KindFacts } from '../../types';
import type { FirstEntry } from '../read-first-entry';
import { characterFacts } from './character-facts';
import { languageFacts } from './language-facts';
import { musicFacts } from './music-facts';

const FACTS: Record<Container, (entry: FirstEntry) => KindFacts | null> = {
  msul: musicFacts,
  rsp: characterFacts,
  rlang: languageFacts,
};

export { FACTS };

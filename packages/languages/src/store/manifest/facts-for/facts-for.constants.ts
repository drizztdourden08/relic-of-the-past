/* @layer shared-store @kind constants */
import type { Container, KindFacts, FirstEntry } from '@rotp/hub-contracts';
import { characterFacts, musicFacts } from '@rotp/hub-contracts';
import { languageFacts } from './language-facts';

const FACTS: Record<Container, (entry: FirstEntry) => KindFacts | null> = {
  msul: musicFacts,
  rsp: characterFacts,
  rlang: languageFacts,
};

export { FACTS };

/* @layer shared-store @kind logic */
import { CONTAINER_MANIFEST } from '@rotp/hub-contracts';
import type { Container, KindFacts, FirstEntry } from '@rotp/hub-contracts';
import { FACTS } from './facts-for.constants';

const factsFor = (container: Container, entry: FirstEntry): KindFacts | null =>
  (entry.name === CONTAINER_MANIFEST[container] ? FACTS[container](entry) : null);

export { factsFor };

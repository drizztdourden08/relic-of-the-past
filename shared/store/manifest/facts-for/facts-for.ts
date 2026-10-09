/* @layer shared-store @kind logic */
import { CONTAINER_MANIFEST } from '../../containers';
import type { Container, KindFacts } from '../../types';
import type { FirstEntry } from '../read-first-entry';
import { FACTS } from './facts-for.constants';

const factsFor = (container: Container, entry: FirstEntry): KindFacts | null =>
  (entry.name === CONTAINER_MANIFEST[container] ? FACTS[container](entry) : null);

export { factsFor };

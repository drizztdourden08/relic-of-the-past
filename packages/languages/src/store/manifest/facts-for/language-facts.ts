/* @layer shared-store @kind logic */
import { isSetHeader } from '../../../sets/rlang-format';
import type { KindFacts } from '@rotp/hub-contracts';
import type { FirstEntry } from '@rotp/hub-contracts';

const languageFacts = ({ manifest }: FirstEntry): KindFacts | null => (isSetHeader(manifest)
  ? { kind: 'language', title: manifest.name, base: manifest.base, origin: manifest.origin }
  : null);

export { languageFacts };

/* @layer shared-store @kind logic */
import { isSetHeader } from '@shared/storage/languages/rlang-format';
import type { KindFacts } from '../../types';
import type { FirstEntry } from '../read-first-entry';

const languageFacts = ({ manifest }: FirstEntry): KindFacts | null => (isSetHeader(manifest)
  ? { kind: 'language', title: manifest.name, base: manifest.base, origin: manifest.origin }
  : null);

export { languageFacts };

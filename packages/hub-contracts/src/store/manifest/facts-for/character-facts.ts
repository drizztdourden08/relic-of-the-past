/* @layer shared-store @kind logic */
import { isRspManifest } from '../../../link-sprites/parse-rsp/is-rsp-manifest';
import type { KindFacts } from '../../types';
import type { FirstEntry } from '../read-first-entry';

const characterFacts = ({ manifest }: FirstEntry): KindFacts | null => (isRspManifest(manifest)
  ? { kind: 'character', title: manifest.meta.name ?? '', author: manifest.meta.author ?? '' }
  : null);

export { characterFacts };

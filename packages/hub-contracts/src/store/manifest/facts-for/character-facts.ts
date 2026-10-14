/* @layer shared-store @kind logic */
import { isRspManifest } from '../../../link-sprites/parse-rsp/is-rsp-manifest';
import type { RspManifest } from '../../../link-sprites/rsp.type';
import type { KindFacts } from '../../types';
import type { FirstEntry } from '../read-first-entry';

const characterFacts = ({ manifest }: FirstEntry): KindFacts | null => {
  if (!isRspManifest(manifest)) return null;
  const meta: Partial<Pick<RspManifest['meta'], 'name' | 'author'>> = manifest.meta;
  return { kind: 'character', title: meta.name ?? '', author: meta.author ?? '' };
};

export { characterFacts };

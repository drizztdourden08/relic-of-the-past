/* @layer shared-storage @kind logic */
import { expectedSpriteFiles } from './expected-sprite-files';
import { fnv1a } from './fnv1a';

const spriteManifestDigest = (): string => {
  const files = expectedSpriteFiles();
  return `${files.length}-${fnv1a([...files].sort().join('\n'))}`;
};

export { spriteManifestDigest };

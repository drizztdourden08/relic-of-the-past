/* @layer shared-asset-extraction @kind logic */
import { ART_LIBRARY } from '../art/art-library';
import { EXTRACTION_FORMAT_VERSION } from '../capacity-icons/capacity-icons.constants';
import { fnv1a } from './fnv1a';
import type { SpriteDef } from '../extract-items/extract-items.type';

const artEntries = (): [string, string][] =>
  Object.keys(ART_LIBRARY).sort().map((name) => [name, ART_LIBRARY[name]]);

const extractionVersionOf = (defs: readonly SpriteDef[]): string =>
  `${EXTRACTION_FORMAT_VERSION}-${fnv1a(JSON.stringify({ defs, art: artEntries() }))}`;

export { extractionVersionOf };

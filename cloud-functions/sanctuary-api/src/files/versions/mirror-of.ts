/* @layer root-config @kind logic */
import type { FileVersion } from '../../../../../shared/sanctuary';
import type { VersionMirror } from './versions.type';

const mirrorOf = ({ name, bytes, sha256, contentType }: FileVersion): VersionMirror => ({ name, bytes, sha256, contentType });

export { mirrorOf };

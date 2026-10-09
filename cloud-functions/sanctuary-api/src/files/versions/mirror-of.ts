/* @layer root-config @kind logic */
import type { FileVersion } from '@rotp/hub-contracts';
import type { VersionMirror } from './versions.type';

const mirrorOf = ({ name, bytes, sha256, contentType }: FileVersion): VersionMirror => ({ name, bytes, sha256, contentType });

export { mirrorOf };

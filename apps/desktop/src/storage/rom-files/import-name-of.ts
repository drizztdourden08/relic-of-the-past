/* @layer renderer-lib @kind logic */
import { isZip } from '@rotp/roms';
import type { RomKindSpec } from '@rotp/roms';

const importNameOf = (fileName: string, bytes: Uint8Array, spec: RomKindSpec): string => {
  const romNamed = spec.pattern.test(fileName);
  if (isZip(bytes)) return romNamed ? `${fileName}.zip` : fileName;
  if (romNamed) return fileName;
  const extension = spec.pickExtensions.find((ext) => ext !== 'zip') ?? '';
  return `${spec.kind}-${bytes.length}.${extension}`;
};

export { importNameOf };

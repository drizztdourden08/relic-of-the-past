/* @layer shared-storage @kind logic */
import { isZip, unzip } from '../archive';
import { ROM_KINDS } from '../kinds';
import type { RomKind } from '../kinds';
import type { ImportPhase, RomCandidate } from './roms.type';

const resolveCandidate = async (
  fileName: string,
  bytes: Uint8Array,
  kind: RomKind,
  onPhase?: ImportPhase,
): Promise<RomCandidate> => {
  const spec = ROM_KINDS[kind];
  const pretty = spec.pickExtensions.filter((ext) => ext !== 'zip').map((ext) => `.${ext}`).join('/');

  if (isZip(bytes)) {
    onPhase?.('extract');
    const found = (await unzip(bytes)).filter((entry) => spec.pattern.test(entry.name));
    const [only] = found;
    if (only === undefined) return { ok: false, error: `No ${pretty} file found in the archive` };
    if (found.length > 1) return { ok: false, error: `Multiple ${pretty} files found (${found.length}). Provide exactly one.` };
    return { ok: true, name: only.name, bytes: only.bytes };
  }

  if (spec.pattern.test(fileName)) return { ok: true, name: fileName, bytes };
  if (bytes.length === 0 || bytes.length > spec.maxBytes) return { ok: false, error: `File is not a valid ${spec.label} or archive` };
  return { ok: true, name: `${kind}-${bytes.length}${pretty.split('/')[0]}`, bytes };
};

export { resolveCandidate };

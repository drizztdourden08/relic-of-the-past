/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { sha256Hex } from '@drizztdourden08/brock-core';
import { ROM_KINDS } from '../kinds';
import type { RomKind } from '../kinds';
import { resolveCandidate } from './resolve-candidate';
import type { ImportPhase, RomImportResult } from './roms.type';

const importBytes = async (
  files: FileStore,
  fileName: string,
  bytes: Uint8Array,
  kind: RomKind = 'snes-alttp',
  onPhase?: ImportPhase,
): Promise<RomImportResult> => {
  const spec = ROM_KINDS[kind];
  const candidate = await resolveCandidate(fileName, bytes, kind, onPhase);
  if (!candidate.ok) return { success: false, error: candidate.error, romFile: '' };

  if (spec.accepts.length > 0) {
    const sha = await sha256Hex(candidate.bytes);
    if (!spec.accepts.includes(sha)) {
      return {
        success: false,
        romFile: '',
        error: `Not a recognised ${spec.label} (SHA-256 ${sha.slice(0, 16)}...). This build only accepts the revision it was reverse-engineered against.`,
      };
    }
  }

  const dest = `roms/${candidate.name}`;
  if (await files.exists(dest)) return { success: true, romFile: candidate.name, alreadyExists: true };
  onPhase?.('copy');
  await files.writeBytes(dest, candidate.bytes);
  return { success: true, romFile: candidate.name, alreadyExists: false };
};

export { importBytes };

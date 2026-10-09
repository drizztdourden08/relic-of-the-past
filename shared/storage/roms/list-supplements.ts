/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { sidecarName } from '../assets';
import { ROM_KINDS } from '../rom-kinds';
import { listEntries } from './list-entries';
import { listRoms } from './list-roms';
import type { SupplementStatus } from './roms.type';

const listSupplements = async (files: FileStore): Promise<SupplementStatus[]> => {
  const bases = await listRoms(files, 'snes-alttp');
  const out: SupplementStatus[] = [];

  for (const entry of await listEntries(files)) {
    const spec = ROM_KINDS[entry.kind];
    if (spec.role !== 'supplement' || !spec.sourceId) continue;

    const attachedTo: string[] = [];
    let bytes: number | null = null;
    for (const base of bases) {
      const stat = await files.stat(`assets/${sidecarName(base, spec.sourceId)}`);
      if (!stat || stat.bytes <= 0) continue;
      attachedTo.push(base);
      bytes = stat.bytes;
    }
    out.push({ romFile: entry.romFile, kind: entry.kind, attachedTo, bytes });
  }
  return out;
};

export { listSupplements };

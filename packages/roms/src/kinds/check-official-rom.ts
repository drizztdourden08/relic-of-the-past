/* @layer shared-storage @kind logic */
import { fanTranslationRefusal, stripSmcHeader } from '@rotp/asset-extraction';
import { officialRomStatuses } from './official-roms';
import { romBodyOf } from './rom-body-of';
import { sha1Hex } from './sha1-hex';
import { ROM_KINDS } from './rom-kind-specs.constants';
import type { RomKind } from './rom-kinds.type';
import type { RomVerdict } from './rom-verdict.type';

const checkOfficialRom = async (fileName: string, bytes: Uint8Array, expected?: RomKind): Promise<RomVerdict> => {
  const body = await romBodyOf(fileName, bytes);
  if (body === 'archive') return { ok: true, message: 'Archive, checked when it is imported' };
  if (body === null) return { ok: false, message: 'The archive holds no ROM file.' };
  const hash = await sha1Hex(stripSmcHeader(body));
  const match = officialRomStatuses().find((rom) => rom.sha1 === hash);
  if (!match) {
    return { ok: false, message: fanTranslationRefusal(hash) ?? `Not an official ROM (SHA-1 ${hash}). Use one from the list below.` };
  }
  if (expected !== undefined && match.kind !== expected) {
    return { ok: false, message: `This is ${match.name}, a ${ROM_KINDS[match.kind].label.toLowerCase()}, not a ${ROM_KINDS[expected].label.toLowerCase()}.` };
  }
  if (!match.supported) return { ok: false, message: `${match.name} is an official ROM, but it is not supported yet.` };
  return { ok: true, message: match.name };
};

export { checkOfficialRom };

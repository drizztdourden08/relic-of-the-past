/* @layer shared-storage @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { stripSmcHeader } from '@rotp/asset-extraction';
import { fanTranslationMessage } from './fan-translation-message';
import { officialRomStatuses } from './official-roms';
import { romBodyOf } from './rom-body-of';
import { sha1Hex } from './sha1-hex';
import type { RomKind } from './rom-kinds.type';
import type { RomVerdict } from './rom-verdict.type';

const checkOfficialRom = async (fileName: string, bytes: Uint8Array, expected?: RomKind): Promise<RomVerdict> => {
  const body = await romBodyOf(fileName, bytes);
  if (body === 'archive') return { ok: true, message: msg('roms:verdict.archive') };
  if (body === null) return { ok: false, message: msg('roms:verdict.archive-empty') };
  const hash = await sha1Hex(stripSmcHeader(body));
  const match = officialRomStatuses().find((rom) => rom.sha1 === hash);
  if (!match) {
    return { ok: false, message: fanTranslationMessage(hash) ?? msg('roms:verdict.not-official', { hash }) };
  }
  if (expected !== undefined && match.kind !== expected) {
    return { ok: false, message: msg('roms:verdict.wrong-kind', { name: match.name, kind: match.kind, expected }) };
  }
  if (!match.supported) return { ok: false, message: msg('roms:verdict.unsupported', { name: match.name }) };
  return { ok: true, message: msg('roms:verdict.official-ok', { name: match.name }) };
};

export { checkOfficialRom };

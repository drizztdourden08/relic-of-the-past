/* @layer shared-asset-extraction @kind constants */
import type { RomHashTable, RomLanguage } from '../rom-types';

const ZELDA3_SHA1_US = '6D4F10A8B10E10DBE624CB23CF03B88BB8252973';

const ZELDA3_JP_TITLE = 'Zelda no Densetsu - Kamigami no Triforce';

const ZELDA3_SHA1: RomHashTable = {
  [ZELDA3_SHA1_US]: { language: 'us', revision: 0, description: 'Legend of Zelda, The - A Link to the Past (USA)' },
  '2E62494967FB0AFDF5DA1635607F9641DF7C6559': { language: 'de', revision: 0, description: 'Legend of Zelda, The - A Link to the Past (Germany)' },
  '229364A1B92A05167CD38609B1AA98F7041987CC': { language: 'fr', revision: 0, description: 'Legend of Zelda, The - A Link to the Past (France)' },
  'C1C6C7F76FFF936C534FF11F87A54162FC0AA100': { language: 'fr-c', revision: 0, description: 'Legend of Zelda, The - A Link to the Past (Canada)' },
  '7C073A222569B9B8E8CA5FCB5DFEC3B5E31DA895': { language: 'en', revision: 0, description: 'Legend of Zelda, The - A Link to the Past (Europe)' },
  'E7E852F0159CE612E3911164878A9B08B3CB9060': { language: 'ja', revision: 0, description: `${ZELDA3_JP_TITLE} (Japan)` },
  '52F470C80157F6843839C39E3BF52AFBB42FB957': { language: 'ja', revision: 1, description: `${ZELDA3_JP_TITLE} (Japan) (Rev 1)` },
  '6D9FA9006C160A0C81DB913BCD0EA3E7CC249BC9': { language: 'ja', revision: 2, description: `${ZELDA3_JP_TITLE} (Japan) (Rev 2)` },
};

const FAN_TRANSLATION_SHA1: Readonly<Record<string, string>> = {
  '461FCBD700D1332009C0E85A7A136E2A8E4B111E': 'the Spanish fan translation',
  '3C4D605EEFDA1D76F101965138F238476655B11D': 'the Polish fan translation',
  'D0D09ED41F9C373FE6AFDCCAFBF0DA8C88D3D90D': 'the Portuguese fan translation',
  'B2A07A59E64C498BC1B2F28728F9BF4014C8D582': 'the English Redux fan translation',
  '9325C22EB0A2A1F0017157C8B620BC3A605CEDE1': 'the English Redux fan translation',
  'FA8ADFDBA2697C9A54D583A1284A22AC764C7637': 'the Dutch fan translation',
  '43CD3438469B2C3FE879EA2F410B3EF3CB3F1CA4': 'the Swedish fan translation',
};

const OFFICIAL_RELEASES: readonly RomLanguage[] = ['us', 'de', 'fr', 'fr-c', 'en'];

const GAME_ROM_LANGUAGE: RomLanguage = 'us';

const SMC_HEADER_BYTES = 0x200;

const DOUBLE_HEADER_LENGTH = 0x10083b;

const ROM_BANK_BYTES = 0x8000;

const PATCHED_ROM_MIN_BYTES = 0x80000;

const PATCHED_ROM_MAX_BYTES = 0x400000;

export {
  DOUBLE_HEADER_LENGTH, FAN_TRANSLATION_SHA1, GAME_ROM_LANGUAGE, OFFICIAL_RELEASES, PATCHED_ROM_MAX_BYTES,
  PATCHED_ROM_MIN_BYTES, ROM_BANK_BYTES, SMC_HEADER_BYTES, ZELDA3_SHA1, ZELDA3_SHA1_US,
};

/* @layer shared-asset-extraction @kind constants */
import type { RomHashTable } from '../rom-types';

const ZELDA3_SHA1_US = '6D4F10A8B10E10DBE624CB23CF03B88BB8252973';

const ZELDA3_SHA1: RomHashTable = {
  [ZELDA3_SHA1_US]: { language: 'us', description: 'Legend of Zelda, The - A Link to the Past (USA)' },
  '2E62494967FB0AFDF5DA1635607F9641DF7C6559': { language: 'de', description: 'Legend of Zelda, The - A Link to the Past (Germany)' },
  '229364A1B92A05167CD38609B1AA98F7041987CC': { language: 'fr', description: 'Legend of Zelda, The - A Link to the Past (France)' },
  'C1C6C7F76FFF936C534FF11F87A54162FC0AA100': { language: 'fr-c', description: 'Legend of Zelda, The - A Link to the Past (Canada)' },
  '7C073A222569B9B8E8CA5FCB5DFEC3B5E31DA895': { language: 'en', description: 'Legend of Zelda, The - A Link to the Past (Europe)' },
  '461FCBD700D1332009C0E85A7A136E2A8E4B111E': { language: 'es', description: 'Spanish - https://www.romhacking.net/translations/2195/' },
  '3C4D605EEFDA1D76F101965138F238476655B11D': { language: 'pl', description: 'Polish - https://www.romhacking.net/translations/5760/' },
  'D0D09ED41F9C373FE6AFDCCAFBF0DA8C88D3D90D': { language: 'pt', description: 'Portuguese - https://www.romhacking.net/translations/6530/' },
  'B2A07A59E64C498BC1B2F28728F9BF4014C8D582': { language: 'redux', description: 'English Redux - https://www.romhacking.net/translations/6657/' },
  '9325C22EB0A2A1F0017157C8B620BC3A605CEDE1': { language: 'redux', description: 'English Redux - https://www.romhacking.net/hacks/2594/' },
  'FA8ADFDBA2697C9A54D583A1284A22AC764C7637': { language: 'nl', description: 'Dutch - https://www.romhacking.net/translations/1124/' },
  '43CD3438469B2C3FE879EA2F410B3EF3CB3F1CA4': { language: 'sv', description: 'Swedish - https://www.romhacking.net/translations/982/' },
};

const SMC_HEADER_BYTES = 0x200;
const SWEDISH_DOUBLE_HEADER_LENGTH = 0x10083b;

export { SMC_HEADER_BYTES, SWEDISH_DOUBLE_HEADER_LENGTH, ZELDA3_SHA1, ZELDA3_SHA1_US };

/**
 * ROM loading with SHA1 validation and version detection.
 * Returns a RomData instance (dependency-injected, no global state).
 */
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import type { RomData, RomLanguage, RomHashTable } from './rom-types';
import { snesToLinear } from './snes-address';

/** Known ROM SHA1 hashes */
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

/**
 * Load a ROM file and return a RomData instance.
 *
 * @param path - Absolute path to the .sfc/.smc ROM file
 * @param supportMultilanguage - If true, accepts any known ROM. If false (default), US-only.
 */
function loadRom(path: string, supportMultilanguage = false): RomData {
  let romBytes = Buffer.from(readFileSync(path));

  // Strip SMC header (512 bytes) if present
  if ((romBytes.length & 0xfffff) === 0x200) {
    romBytes = romBytes.subarray(0x200);
  }

  const hash = createHash('sha1').update(romBytes).digest('hex').toUpperCase();
  const entry = ZELDA3_SHA1[hash];

  // Workaround for Swedish ROM with broken size
  if (entry?.language === 'sv' && romBytes.length === 0x10083b) {
    romBytes = romBytes.subarray(0x200);
  }

  if (supportMultilanguage) {
    if (!entry) {
      const supported = Object.entries(ZELDA3_SHA1)
        .map(([k, v]) => `  ${v.language}: ${k}: ${v.description}`)
        .join('\n');
      throw new Error(
        `ROM with hash ${hash} not supported.\n\nYou need one of the following ROMs:\n${supported}`
      );
    }
  } else {
    if (!entry || entry.language !== 'us') {
      throw new Error(
        `ROM with hash ${hash} not supported.\n\nExpected ${ZELDA3_SHA1_US}.\n` +
        `Please verify your ROM is "Legend of Zelda, The - A Link to the Past (USA)"`
      );
    }
  }

  const language: RomLanguage = entry!.language;
  const description = entry!.description;

  return createRomData(romBytes, language, description);
}

/**
 * Load ROM from a Buffer (useful when the file is already in memory, e.g. from Electron IPC).
 */
function loadRomFromBuffer(buffer: Buffer, supportMultilanguage = false): RomData {
  let romBytes = buffer;

  // Strip SMC header if present
  if ((romBytes.length & 0xfffff) === 0x200) {
    romBytes = romBytes.subarray(0x200);
  }

  const hash = createHash('sha1').update(romBytes).digest('hex').toUpperCase();
  const entry = ZELDA3_SHA1[hash];

  if (entry?.language === 'sv' && romBytes.length === 0x10083b) {
    romBytes = romBytes.subarray(0x200);
  }

  if (supportMultilanguage) {
    if (!entry) {
      throw new Error(`ROM with hash ${hash} not supported.`);
    }
  } else {
    if (!entry || entry.language !== 'us') {
      throw new Error(`ROM with hash ${hash} not supported. Expected US ROM.`);
    }
  }

  return createRomData(romBytes, entry!.language, entry!.description);
}

function createRomData(bytes: Buffer, language: RomLanguage, description: string): RomData {
  return {
    bytes,
    language,
    description,

    getByte(ea: number): number {
      const offset = snesToLinear(ea);
      return bytes[offset];
    },

    getWord(ea: number): number {
      return this.getByte(ea) + this.getByte(ea + 1) * 256;
    },

    get24(ea: number): number {
      return this.getByte(ea) + this.getByte(ea + 1) * 256 + this.getByte(ea + 2) * 65536;
    },

    getInt8(ea: number): number {
      const b = this.getByte(ea);
      return b & 0x80 ? b - 256 : b;
    },

    getInt16(ea: number): number {
      const w = this.getWord(ea);
      return w & 0x8000 ? w - 65536 : w;
    },

    getBytes(addr: number, n: number): Buffer {
      const result = Buffer.alloc(n);
      let a = addr;
      for (let i = 0; i < n; i++) {
        result[i] = this.getByte(a);
        a += 1;
        if ((a & 0x8000) === 0) {
          a += 0x8000;
        }
      }
      return result;
    },

    getWords(addr: number, n: number): number[] {
      const result: number[] = new Array(n);
      let a = addr;
      for (let i = 0; i < n; i++) {
        result[i] = this.getWord(a);
        a += 2;
        if ((a & 0x8000) === 0) {
          a += 0x8000;
        }
      }
      return result;
    },
  };
}

export {
  ZELDA3_SHA1,
  ZELDA3_SHA1_US,
  loadRom,
  loadRomFromBuffer
};

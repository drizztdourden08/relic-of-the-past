/* @layer shared-storage @kind data */
import type { OfficialRom } from './official-roms.type';

const ZELDA3_TITLE = 'Legend of Zelda, The - A Link to the Past';
const ZELDA3_JP_TITLE = 'Zelda no Densetsu - Kamigami no Triforce';
const GBA_TITLE = 'Legend of Zelda, The - A Link to the Past & Four Swords';

const OFFICIAL_ROMS: readonly OfficialRom[] = [
  { name: `${ZELDA3_TITLE} (USA)`, kind: 'snes-alttp', sha1: '6D4F10A8B10E10DBE624CB23CF03B88BB8252973' },
  { name: `${ZELDA3_TITLE} (Europe)`, kind: 'snes-alttp', sha1: '7C073A222569B9B8E8CA5FCB5DFEC3B5E31DA895' },
  { name: `${ZELDA3_TITLE} (Germany)`, kind: 'snes-alttp', sha1: '2E62494967FB0AFDF5DA1635607F9641DF7C6559' },
  { name: `${ZELDA3_TITLE} (France)`, kind: 'snes-alttp', sha1: '229364A1B92A05167CD38609B1AA98F7041987CC' },
  { name: `${ZELDA3_TITLE} (Canada) (Fr)`, kind: 'snes-alttp', sha1: 'C1C6C7F76FFF936C534FF11F87A54162FC0AA100' },
  { name: `${ZELDA3_TITLE} (USA, Europe) (Switch Online)`, kind: 'snes-alttp', sha1: 'CCE2817177FE8D0CA2409934B2777526FE7008BC' },
  { name: `${ZELDA3_JP_TITLE} (Japan)`, kind: 'snes-alttp', sha1: 'E7E852F0159CE612E3911164878A9B08B3CB9060' },
  { name: `${ZELDA3_JP_TITLE} (Japan) (Rev 1)`, kind: 'snes-alttp', sha1: '52F470C80157F6843839C39E3BF52AFBB42FB957' },
  { name: `${ZELDA3_JP_TITLE} (Japan) (Rev 2)`, kind: 'snes-alttp', sha1: '6D9FA9006C160A0C81DB913BCD0EA3E7CC249BC9' },
  { name: `${ZELDA3_JP_TITLE} (Japan) (Rev 2) (Virtual Console, Switch Online)`, kind: 'snes-alttp', sha1: '169EC9CC3797ACA473371DF3F9BFBAB9E57FCDD5' },
  { name: `${GBA_TITLE} (USA)`, kind: 'gba-alttp', sha1: 'A272055ABBBF6C26B0CD54C87395D01699589161' },
  { name: `${GBA_TITLE} (Europe) (En,Fr,De,Es,It)`, kind: 'gba-alttp', sha1: '3BB7F97ADA7D60D8D334B271084EFFD1DB853B32' },
];

export { OFFICIAL_ROMS };

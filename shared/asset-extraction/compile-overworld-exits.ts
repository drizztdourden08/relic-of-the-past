/* @layer shared-asset-extraction @kind logic */
/**
 * Overworld exit and special exit data compilation.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';

const buildOverworldExits = (rom: RomData, A: AssetBuilder): void => {
  const exitScreen = new Array(79).fill(0);
  const exitRooms = new Array(79).fill(0);
  const exitLoadOff = new Array(79).fill(0);
  const exitScrollX = new Array(79).fill(0);
  const exitScrollY = new Array(79).fill(0);
  const exitX = new Array(79).fill(0);
  const exitY = new Array(79).fill(0);
  const exitCamX = new Array(79).fill(0);
  const exitCamY = new Array(79).fill(0);
  const exitNDoor = new Array(79).fill(0);
  const exitFDoor = new Array(79).fill(0);
  const exitUnk1 = new Array(79).fill(0);
  const exitUnk3 = new Array(79).fill(0);

  const spTop = new Array(16).fill(0);
  const spBot = new Array(16).fill(0);
  const spLeft = new Array(16).fill(0);
  const spRight = new Array(16).fill(0);
  const spT4 = new Array(16).fill(0);
  const spT5 = new Array(16).fill(0);
  const spT6 = new Array(16).fill(0);
  const spT7 = new Array(16).fill(0);
  const spLeftEdge = new Array(16).fill(0);
  const spDir = new Array(16).fill(0);
  const spSprGfx = new Array(16).fill(0);
  const spAuxGfx = new Array(16).fill(0);
  const spPalBg = new Array(16).fill(0);
  const spPalSpr = new Array(16).fill(0);

  for (let i = 0; i < 79; i++) {
    exitScreen[i] = rom.getByte(0x82de28 + i);
    const room = rom.getWord(0x82dd8a + i * 2);
    exitRooms[i] = room;
    exitLoadOff[i] = rom.getWord(0x82de77 + i * 2);
    exitScrollX[i] = rom.getWord(0x82dfb3 + i * 2);
    exitScrollY[i] = rom.getWord(0x82df15 + i * 2);
    exitX[i] = rom.getWord(0x82e0ef + i * 2);
    exitY[i] = rom.getWord(0x82e051 + i * 2);
    exitCamX[i] = rom.getWord(0x82e22b + i * 2);
    exitCamY[i] = rom.getWord(0x82e18d + i * 2);
    exitUnk1[i] = rom.getInt8(0x82e2c9 + i);
    exitUnk3[i] = rom.getInt8(0x82e318 + i);
    exitNDoor[i] = rom.getWord(0x82e367 + i * 2);
    exitFDoor[i] = rom.getWord(0x82e405 + i * 2);

    if (room >= 0x180 && room < 0x190) {
      const j = room - 0x180;
      spDir[j] = rom.getByte(0x82e801 + j) & 0xfe;
      spSprGfx[j] = rom.getByte(0x82e811 + j);
      spAuxGfx[j] = rom.getByte(0x82e821 + j);
      spPalBg[j] = rom.getByte(0x82e831 + j);
      spPalSpr[j] = rom.getByte(0x82e841 + j);
      spTop[j] = rom.getWord(0x82e6e1 + j * 2);
      spBot[j] = rom.getWord(0x82e701 + j * 2);
      spLeft[j] = rom.getWord(0x82e721 + j * 2);
      spRight[j] = rom.getWord(0x82e741 + j * 2);
      spLeftEdge[j] = rom.getWord(0x82e7e1 + j * 2);
      spT4[j] = rom.getInt16(0x82e761 + j * 2);
      spT6[j] = rom.getInt16(0x82e781 + j * 2);
      spT5[j] = rom.getInt16(0x82e7a1 + j * 2);
      spT7[j] = rom.getInt16(0x82e7c1 + j * 2);
    }
  }

  A.addUint8('kExitData_ScreenIndex', exitScreen);
  A.addUint16('kExitDataRooms', exitRooms);
  A.addUint16('kExitData_Map16LoadSrcOff', exitLoadOff);
  A.addUint16('kExitData_ScrollX', exitScrollX);
  A.addUint16('kExitData_ScrollY', exitScrollY);
  A.addUint16('kExitData_XCoord', exitX);
  A.addUint16('kExitData_YCoord', exitY);
  A.addUint16('kExitData_CameraXScroll', exitCamX);
  A.addUint16('kExitData_CameraYScroll', exitCamY);
  A.addUint16('kExitData_NormalDoor', exitNDoor);
  A.addUint16('kExitData_FancyDoor', exitFDoor);
  A.addInt8('kExitData_Unk1', exitUnk1);
  A.addInt8('kExitData_Unk3', exitUnk3);

  A.addUint16('kSpExit_Top', spTop);
  A.addUint16('kSpExit_Bottom', spBot);
  A.addUint16('kSpExit_Left', spLeft);
  A.addUint16('kSpExit_Right', spRight);
  A.addInt16('kSpExit_Tab4', spT4);
  A.addInt16('kSpExit_Tab5', spT5);
  A.addInt16('kSpExit_Tab6', spT6);
  A.addInt16('kSpExit_Tab7', spT7);
  A.addUint16('kSpExit_LeftEdgeOfMap', spLeftEdge);
  A.addUint8('kSpExit_Dir', spDir);
  A.addUint8('kSpExit_SprGfx', spSprGfx);
  A.addUint8('kSpExit_AuxGfx', spAuxGfx);
  A.addUint8('kSpExit_PalBg', spPalBg);
  A.addUint8('kSpExit_PalSpr', spPalSpr);
};

export { buildOverworldExits };

/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { appendExtraExit } from '../extensions/second-cartridge-links';
import { readOverworldExits } from './read-overworld-exits';
import { readSpecialExits } from './read-special-exits';

const buildOverworldExits = (rom: RomData, A: AssetBuilder): void => {
  const exits = readOverworldExits(rom);
  const sp = readSpecialExits(rom, exits.rooms);

  appendExtraExit(exits);

  A.addUint8('kExitData_ScreenIndex', exits.screen);
  A.addUint16('kExitDataRooms', exits.rooms);
  A.addUint16('kExitData_Map16LoadSrcOff', exits.loadOff);
  A.addUint16('kExitData_ScrollX', exits.scrollX);
  A.addUint16('kExitData_ScrollY', exits.scrollY);
  A.addUint16('kExitData_XCoord', exits.x);
  A.addUint16('kExitData_YCoord', exits.y);
  A.addUint16('kExitData_CameraXScroll', exits.camX);
  A.addUint16('kExitData_CameraYScroll', exits.camY);
  A.addUint16('kExitData_NormalDoor', exits.nDoor);
  A.addUint16('kExitData_FancyDoor', exits.fDoor);
  A.addInt8('kExitData_Unk1', exits.unk1);
  A.addInt8('kExitData_Unk3', exits.unk3);

  A.addUint16('kSpExit_Top', sp.top);
  A.addUint16('kSpExit_Bottom', sp.bottom);
  A.addUint16('kSpExit_Left', sp.left);
  A.addUint16('kSpExit_Right', sp.right);
  A.addInt16('kSpExit_Tab4', sp.tab4);
  A.addInt16('kSpExit_Tab5', sp.tab5);
  A.addInt16('kSpExit_Tab6', sp.tab6);
  A.addInt16('kSpExit_Tab7', sp.tab7);
  A.addUint16('kSpExit_LeftEdgeOfMap', sp.leftEdge);
  A.addUint8('kSpExit_Dir', sp.dir);
  A.addUint8('kSpExit_SprGfx', sp.sprGfx);
  A.addUint8('kSpExit_AuxGfx', sp.auxGfx);
  A.addUint8('kSpExit_PalBg', sp.palBg);
  A.addUint8('kSpExit_PalSpr', sp.palSpr);
};

export { buildOverworldExits };

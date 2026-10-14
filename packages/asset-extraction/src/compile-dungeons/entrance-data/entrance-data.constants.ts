/* @layer shared-asset-extraction @kind constants */
import type { EntranceAsset, EntranceColumn } from './entrance-data.type';

const ENTRANCE_COLUMNS: readonly EntranceColumn[] = [
  { key: 'rooms', kind: 'word', main: 0x82c813, extra: 0x82db6e },
  { key: 'scrollX', kind: 'word', main: 0x82cd45, extra: 0x82dbb4 },
  { key: 'scrollY', kind: 'word', main: 0x82ce4f, extra: 0x82dbc2 },
  { key: 'playerX', kind: 'word', main: 0x82d063, extra: 0x82dbde },
  { key: 'playerY', kind: 'word', main: 0x82cf59, extra: 0x82dbd0 },
  { key: 'cameraX', kind: 'word', main: 0x82d277, extra: 0x82dbfa },
  { key: 'cameraY', kind: 'word', main: 0x82d16d, extra: 0x82dbec },
  { key: 'blockset', kind: 'byte', main: 0x82d381, extra: 0x82dc08 },
  { key: 'floor', kind: 'int8', main: 0x82d406, extra: 0x82dc0f },
  { key: 'palace', kind: 'int8', main: 0x82d48b, extra: 0x82dc16 },
  { key: 'doorway', kind: 'int8', main: 0x82d510, extra: null },
  { key: 'startBg', kind: 'byte', main: 0x82d595, extra: 0x82dc1d },
  { key: 'quad1', kind: 'byte', main: 0x82d61a, extra: 0x82dc24 },
  { key: 'quad2', kind: 'byte', main: 0x82d69f, extra: 0x82dc2b },
  { key: 'doorSettings', kind: 'word', main: 0x82d724, extra: 0x82dc32 },
  { key: 'music', kind: 'byte', main: 0x82d82e, extra: 0x82dc4e },
  { key: 'entrance', kind: 'word', main: null, extra: 0x82dc40 },
];

const ENTRANCE_ASSETS: readonly EntranceAsset[] = [
  { key: 'rooms', name: 'rooms', add: 'addUint16' },
  { key: 'relCoords', name: 'relativeCoords', add: 'addUint8' },
  { key: 'scrollX', name: 'scrollX', add: 'addUint16' },
  { key: 'scrollY', name: 'scrollY', add: 'addUint16' },
  { key: 'playerX', name: 'playerX', add: 'addUint16' },
  { key: 'playerY', name: 'playerY', add: 'addUint16' },
  { key: 'cameraX', name: 'cameraX', add: 'addUint16' },
  { key: 'cameraY', name: 'cameraY', add: 'addUint16' },
  { key: 'blockset', name: 'blockset', add: 'addUint8' },
  { key: 'floor', name: 'floor', add: 'addInt8' },
  { key: 'palace', name: 'palace', add: 'addInt8' },
  { key: 'doorway', name: 'doorwayOrientation', add: 'addUint8' },
  { key: 'startBg', name: 'startingBg', add: 'addUint8' },
  { key: 'quad1', name: 'quadrant1', add: 'addUint8' },
  { key: 'quad2', name: 'quadrant2', add: 'addUint8' },
  { key: 'doorSettings', name: 'doorSettings', add: 'addUint16' },
  { key: 'entrance', name: 'entrance', add: 'addUint8', onlySet: 1 },
  { key: 'music', name: 'musicTrack', add: 'addUint8' },
];

const REL_COORDS_PER_ENTRANCE = 8;
const REL_COORDS_MAIN = 0x82c91d;
const REL_COORDS_EXTRA = 0x82db7c;

export { ENTRANCE_ASSETS, ENTRANCE_COLUMNS, REL_COORDS_EXTRA, REL_COORDS_MAIN, REL_COORDS_PER_ENTRANCE };

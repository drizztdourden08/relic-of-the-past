/* @layer bridge-wasm @kind logic */
import type { ApGetDataPackagePacket } from '../ap-protocol.type';

const buildGetDataPackage = (games: string[]): ApGetDataPackagePacket => ({
  cmd: 'GetDataPackage',
  games,
});

export { buildGetDataPackage };

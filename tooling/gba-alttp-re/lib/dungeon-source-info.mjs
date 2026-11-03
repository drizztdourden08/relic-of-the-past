/* @layer scripts @kind tooling */
import { hashBuffer } from './common.mjs';

const dungeonSourceInfo = ({ gbaPath, gba, snesPath, snes }) => ({
  gbaPath,
  gbaSha256: hashBuffer(gba, 'sha256'),
  snesPath,
  snesSha1: hashBuffer(snes, 'sha1'),
});

export { dungeonSourceInfo };

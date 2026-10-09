/* @layer shared-asset-extraction @kind logic */
import { CURRENT_BAKE_VERSION, STAMP_MAGIC, STAMP_OFFSET, VERSION_OFFSET } from './bake-version.constants';

const stampBakeVersion = (dat: Buffer): void => {
  dat.write(STAMP_MAGIC, STAMP_OFFSET, 'ascii');
  dat.writeUInt32LE(CURRENT_BAKE_VERSION, VERSION_OFFSET);
};

export { stampBakeVersion };

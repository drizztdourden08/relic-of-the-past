/* @layer shared-asset-extraction @kind logic */
import { CURRENT_BAKE_VERSION } from './bake-version.constants';
import { readBakeVersion } from './read-bake-version';

const isCurrentBakeVersion = (dat: Uint8Array): boolean =>
  readBakeVersion(dat) === CURRENT_BAKE_VERSION;

export { isCurrentBakeVersion };

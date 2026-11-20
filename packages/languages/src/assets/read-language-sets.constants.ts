/* @layer shared-storage @kind constants */
import type { RomFontBytes } from '../sets';

const NO_FONT: RomFontBytes = { fontData: new Uint8Array(0), fontWidth: new Uint8Array(0) };

export { NO_FONT };

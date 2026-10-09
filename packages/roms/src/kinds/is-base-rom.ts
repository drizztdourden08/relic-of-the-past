/* @layer shared-storage @kind logic */
import { ROM_KINDS } from './rom-kind-specs.constants';

const isBaseRom = (fileName: string): boolean => ROM_KINDS['snes-alttp'].pattern.test(fileName);

export { isBaseRom };

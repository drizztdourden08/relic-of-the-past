/* @layer shared-storage @kind logic */
import { ROM_FONT_FILES } from '@rotp/hub-contracts';

const fontPath = (code: string): string => `rom-fonts/${code}/${ROM_FONT_FILES.font}`;

export { fontPath };

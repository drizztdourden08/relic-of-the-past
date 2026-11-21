/* @layer shared-storage @kind logic */
import { ROM_FONT_FILES } from '@rotp/hub-contracts';

const fontWidthPath = (code: string): string => `rom-fonts/${code}/${ROM_FONT_FILES.fontWidth}`;

export { fontWidthPath };

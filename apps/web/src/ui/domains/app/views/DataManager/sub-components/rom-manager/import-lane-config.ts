/* @layer renderer-components @kind logic */
/** Per-kind wiring for the ImportForm the active lane renders. */
import type { RomKind } from '@shared/storage/rom-kinds';

interface ImportLaneConfig {
  placeholder: string;
  accept: string[];
  dropLabel: string;
  dropHint: string;
}

const IMPORT_LANE_CONFIG: Record<RomKind, ImportLaneConfig> = {
  'snes-alttp': {
    placeholder: 'Paste ROM download URL…',
    accept: ['.sfc', '.smc', '.zip', '.7z', '.rar'],
    dropLabel: 'Drop ROM file here',
    dropHint: '.sfc, .smc, or compressed archive (.zip, .7z, .rar)',
  },
  'gba-alttp': {
    placeholder: 'Paste supplement download URL…',
    accept: ['.gba', '.zip', '.7z', '.rar'],
    dropLabel: 'Drop supplement file here',
    dropHint: '.gba, or compressed archive (.zip, .7z, .rar)',
  },
};

export { IMPORT_LANE_CONFIG };
export type { ImportLaneConfig };

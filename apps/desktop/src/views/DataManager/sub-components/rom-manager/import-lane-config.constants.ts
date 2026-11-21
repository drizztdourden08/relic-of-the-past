/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { RomKind } from '@rotp/roms';
import type { ImportLaneConfig } from './import-lane-config.type';

const importLaneConfig = (t: I18n['t']): Record<RomKind, ImportLaneConfig> => ({
  'snes-alttp': {
    description: t('wizards:rom.lane.snes-description'),
    placeholder: t('wizards:rom.lane.snes-placeholder'),
    accept: ['.sfc', '.smc', '.zip', '.7z', '.rar'],
    dropLabel: t('wizards:rom.lane.snes-drop-label'),
    dropHint: t('wizards:rom.lane.snes-drop-hint'),
  },
  'gba-alttp': {
    description: t('wizards:rom.lane.gba-description'),
    placeholder: t('wizards:rom.lane.gba-placeholder'),
    accept: ['.gba', '.zip', '.7z', '.rar'],
    dropLabel: t('wizards:rom.lane.gba-drop-label'),
    dropHint: t('wizards:rom.lane.gba-drop-hint'),
  },
});

export { importLaneConfig };

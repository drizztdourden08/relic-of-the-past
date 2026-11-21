/* @layer renderer-hooks @kind logic */
import type { StudioActionGroup } from '@app/studio';
import type { StudioGroupsParams } from '../PlayerSpriteStudio.type';

const exportGroup = (params: StudioGroupsParams): StudioActionGroup => {
  const { sheet, busy, exporter, run, t } = params;
  const exportAs = (container: 'zspr' | 'rsp') => run(async () => { await exporter.exportSheet(sheet, container); });

  return {
    id: 'export',
    label: t('views-player-sprite-studio:export.group'),
    actions: [
      { id: 'export-rsp', label: t('views-player-sprite-studio:export.rsp'), variant: 'tertiary', disabled: busy, onSelect: () => exportAs('rsp') },
      { id: 'export-zspr', label: t('views-player-sprite-studio:export.zspr'), variant: 'tertiary', disabled: busy, onSelect: () => exportAs('zspr') },
    ],
  };
};

export { exportGroup };

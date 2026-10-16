/* @layer renderer-hooks @kind logic */
import type { StudioActionGroup } from '@app/studio';
import type { StudioGroupsParams } from '../PlayerSpriteStudio.type';

const exportGroup = (params: StudioGroupsParams): StudioActionGroup => {
  const { sheet, busy, exporter, run } = params;
  const exportAs = (container: 'zspr' | 'rsp') => run(async () => { await exporter.exportSheet(sheet, container); });

  return {
    id: 'export',
    label: 'Export',
    actions: [
      { id: 'export-rsp', label: 'Export .rsp', variant: 'tertiary', disabled: busy, onSelect: () => exportAs('rsp') },
      { id: 'export-zspr', label: 'Export .zspr', variant: 'tertiary', disabled: busy, onSelect: () => exportAs('zspr') },
    ],
  };
};

export { exportGroup };

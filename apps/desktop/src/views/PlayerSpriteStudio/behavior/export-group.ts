/* @layer renderer-hooks @kind logic */
import type { StudioActionGroup } from '../../../compounds/StudioFrame';
import { HINTS } from '../PlayerSpriteStudio.constants';
import type { StudioGroupsParams } from '../PlayerSpriteStudio.type';

const exportGroup = (params: StudioGroupsParams): StudioActionGroup => {
  const { sheet, busy, exporter, run } = params;
  const locked = busy || sheet === null;
  const exportAs = (container: 'zspr' | 'rsp') => run(async () => {
    if (sheet) await exporter.exportSheet(sheet, container);
  });

  return {
    id: 'export',
    label: 'Export a file',
    actions: [
      { id: 'export-rsp', label: 'Export .rsp', variant: 'tertiary', hint: HINTS.exportRsp, disabled: locked, onSelect: () => exportAs('rsp') },
      { id: 'export-zspr', label: 'Export .zspr', variant: 'tertiary', hint: HINTS.exportZspr, disabled: locked, onSelect: () => exportAs('zspr') },
    ],
  };
};

export { exportGroup };

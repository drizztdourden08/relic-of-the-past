/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { StudioActionGroup } from '@app/studio';
import type { StudioActionsParams } from './studio-frame.type';

const useStudioActions = (params: StudioActionsParams): StudioActionGroup[] => {
  const { busy, exporting, onExport } = params;

  return useMemo<StudioActionGroup[]>(() => [{
    id: 'export',
    label: 'Export',
    actions: [
      {
        id: 'export-msul',
        label: exporting === 'msul' ? 'Exporting...' : 'Export .msul',
        variant: 'primary',
        disabled: busy,
        onSelect: () => { onExport('msul'); },
      },
      {
        id: 'export-msu1',
        label: exporting === 'msu1' ? 'Exporting...' : 'Export MSU-1',
        disabled: busy,
        onSelect: () => { onExport('msu1'); },
      },
    ],
  }], [busy, exporting, onExport]);
};

export { useStudioActions };

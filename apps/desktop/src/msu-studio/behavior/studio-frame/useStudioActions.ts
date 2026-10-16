/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { StudioActionGroup } from '@app/studio';
import {
  EXPORT_GROUP_LABEL, EXPORT_MSU1_HINT, EXPORT_MSUL_HINT,
} from '../../studio-frame/studio-frame.constants';
import type { StudioActionsParams } from './studio-frame.type';

const useStudioActions = (params: StudioActionsParams): StudioActionGroup[] => {
  const { hasPack, busy, exporting, onExport } = params;

  return useMemo<StudioActionGroup[]>(() => [{
    id: 'export',
    label: EXPORT_GROUP_LABEL,
    actions: [
      {
        id: 'export-msul',
        label: exporting === 'msul' ? 'Exporting...' : 'Export .msul',
        hint: EXPORT_MSUL_HINT,
        variant: 'primary',
        disabled: !hasPack || busy,
        onSelect: () => { onExport('msul'); },
      },
      {
        id: 'export-msu1',
        label: exporting === 'msu1' ? 'Exporting...' : 'Export MSU-1',
        hint: EXPORT_MSU1_HINT,
        disabled: !hasPack || busy,
        onSelect: () => { onExport('msu1'); },
      },
    ],
  }], [hasPack, busy, exporting, onExport]);
};

export { useStudioActions };

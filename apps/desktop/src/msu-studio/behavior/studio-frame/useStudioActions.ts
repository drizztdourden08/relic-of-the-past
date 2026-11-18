/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import type { StudioActionGroup } from '@app/studio';
import type { StudioActionsParams } from './studio-frame.type';

const useStudioActions = (params: StudioActionsParams): StudioActionGroup[] => {
  const { busy, exporting, onExport } = params;
  const t = useT();

  return useMemo<StudioActionGroup[]>(() => [{
    id: 'export',
    label: t('msu-studio:studio.export.group'),
    actions: [
      {
        id: 'export-msul',
        label: exporting === 'msul' ? t('msu-studio:studio.export.running') : t('msu-studio:studio.export.msul'),
        variant: 'primary',
        disabled: busy,
        onSelect: () => { onExport('msul'); },
      },
      {
        id: 'export-msu1',
        label: exporting === 'msu1' ? t('msu-studio:studio.export.running') : t('msu-studio:studio.export.msu1'),
        disabled: busy,
        onSelect: () => { onExport('msu1'); },
      },
    ],
  }], [t, busy, exporting, onExport]);
};

export { useStudioActions };

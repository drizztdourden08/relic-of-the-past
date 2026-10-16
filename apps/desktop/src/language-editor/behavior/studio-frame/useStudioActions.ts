/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { StudioActionGroup } from '@app/studio';
import type { StudioActionsParams } from './studio-frame.type';

const useStudioActions = (params: StudioActionsParams): StudioActionGroup[] => {
  const { readOnly, dirty, saving, exporting, onSave, onExport } = params;

  return useMemo<StudioActionGroup[]>(() => [
    {
      id: 'save',
      label: 'Save',
      actions: [{
        id: 'save',
        label: 'Save now',
        variant: 'primary',
        disabled: readOnly || !dirty || saving,
        onSelect: () => { void onSave(); },
      }],
    },
    {
      id: 'export',
      label: 'Export',
      actions: [{
        id: 'export',
        label: exporting ? 'Exporting...' : 'Export .rlang',
        disabled: saving || exporting,
        onSelect: () => { void onExport(); },
      }],
    },
  ], [readOnly, dirty, saving, exporting, onSave, onExport]);
};

export { useStudioActions };

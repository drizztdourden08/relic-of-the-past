/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { StudioActionGroup } from '@app/studio';
import {
  EXPORT_GROUP_LABEL, EXPORT_HINT, SAVE_GROUP_LABEL, SAVE_HINT,
} from '../../sub-components/studio-frame/studio-frame.constants';
import type { StudioActionsParams } from './studio-frame.type';

const useStudioActions = (params: StudioActionsParams): StudioActionGroup[] => {
  const { hasSet, readOnly, dirty, saving, exporting, onSave, onExport } = params;

  return useMemo<StudioActionGroup[]>(() => [
    {
      id: 'save',
      label: SAVE_GROUP_LABEL,
      actions: [{
        id: 'save',
        label: 'Save now',
        hint: SAVE_HINT,
        variant: 'primary',
        disabled: !hasSet || readOnly || !dirty || saving,
        onSelect: () => { void onSave(); },
      }],
    },
    {
      id: 'export',
      label: EXPORT_GROUP_LABEL,
      actions: [{
        id: 'export',
        label: exporting ? 'Exporting...' : 'Export .rlang',
        hint: EXPORT_HINT,
        disabled: !hasSet || saving || exporting,
        onSelect: () => { void onExport(); },
      }],
    },
  ], [hasSet, readOnly, dirty, saving, exporting, onSave, onExport]);
};

export { useStudioActions };

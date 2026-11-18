/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import type { StudioActionGroup } from '@app/studio';
import type { StudioActionsParams } from './studio-frame.type';

const useStudioActions = (params: StudioActionsParams): StudioActionGroup[] => {
  const { readOnly, dirty, saving, exporting, onSave, onExport } = params;
  const t = useT();

  return useMemo<StudioActionGroup[]>(() => [
    {
      id: 'save',
      label: t('language-editor:actions.save.group'),
      actions: [{
        id: 'save',
        label: t('language-editor:actions.save.now'),
        variant: 'primary',
        disabled: readOnly || !dirty || saving,
        onSelect: () => { void onSave(); },
      }],
    },
    {
      id: 'export',
      label: t('language-editor:actions.export.group'),
      actions: [{
        id: 'export',
        label: exporting ? t('language-editor:actions.export.busy') : t('language-editor:actions.export.rlang'),
        disabled: saving || exporting,
        onSelect: () => { void onExport(); },
      }],
    },
  ], [t, readOnly, dirty, saving, exporting, onSave, onExport]);
};

export { useStudioActions };

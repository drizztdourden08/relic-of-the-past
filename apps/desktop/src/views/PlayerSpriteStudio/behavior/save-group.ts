/* @layer renderer-hooks @kind logic */
import type { StudioActionGroup } from '@app/studio';
import { HINTS } from '../PlayerSpriteStudio.constants';
import type { StudioGroupsParams } from '../PlayerSpriteStudio.type';

const saveGroup = (params: StudioGroupsParams): StudioActionGroup => {
  const { sheet, busy, readOnly, dirty, isNew, draft, library, run } = params;
  const locked = busy || readOnly || sheet === null;
  const saveAs = (container: 'zspr' | 'rsp') => run(async () => {
    if (!sheet) return;
    await draft.save(`${sheet.meta.name || 'sprite'}.${container}`);
    await library.refresh();
  });

  return {
    id: 'save',
    label: 'Save to this app',
    actions: [
      {
        id: 'save',
        label: 'Save',
        variant: 'primary',
        hint: HINTS.save,
        disabled: locked || (!dirty && !isNew),
        onSelect: () => run(async () => { await draft.save(); await library.refresh(); }),
      },
      { id: 'save-rsp', label: 'Save as pack', hint: HINTS.saveRsp, disabled: locked, onSelect: () => saveAs('rsp') },
      { id: 'save-zspr', label: 'Save as .zspr', hint: HINTS.saveZspr, disabled: locked, onSelect: () => saveAs('zspr') },
      { id: 'revert', label: 'Revert', variant: 'ghost', hint: HINTS.revert, disabled: locked || !dirty, onSelect: draft.revert },
    ],
  };
};

export { saveGroup };

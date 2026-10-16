/* @layer renderer-hooks @kind logic */
import type { StudioActionGroup } from '@app/studio';
import type { StudioGroupsParams } from '../PlayerSpriteStudio.type';

const saveGroup = (params: StudioGroupsParams): StudioActionGroup => {
  const { sheet, busy, readOnly, dirty, isNew, draft, library, run } = params;
  const locked = busy || readOnly;
  const saveAs = (container: 'zspr' | 'rsp') => run(async () => {
    await draft.save(`${sheet.meta.name || 'sprite'}.${container}`);
    await library.refresh();
  });

  return {
    id: 'save',
    label: 'Save',
    actions: [
      {
        id: 'save',
        label: 'Save',
        variant: 'primary',
        disabled: locked || (!dirty && !isNew),
        onSelect: () => run(async () => { await draft.save(); await library.refresh(); }),
      },
      { id: 'save-rsp', label: 'Save as .rsp', disabled: locked, onSelect: () => saveAs('rsp') },
      { id: 'save-zspr', label: 'Save as .zspr', disabled: locked, onSelect: () => saveAs('zspr') },
      { id: 'revert', label: 'Revert', variant: 'ghost', disabled: locked || !dirty, onSelect: draft.revert },
    ],
  };
};

export { saveGroup };

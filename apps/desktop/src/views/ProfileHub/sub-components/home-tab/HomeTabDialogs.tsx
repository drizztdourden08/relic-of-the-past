/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { ConfirmSaveDialogs } from './dialogs/ConfirmSaveDialogs';
import { CreateSaveDialog } from './dialogs/CreateSaveDialog';
import { ImportSramDialog } from './dialogs/ImportSramDialog';
import { InvalidSramDialog } from './dialogs/InvalidSramDialog';
import type { HomeTabDialogsProps } from './home-tab.type';
import './HomeTabDialogs.css';

const HomeTabDialogs = ({ saves }: HomeTabDialogsProps) => {
  const { setDialog } = saves;
  const closeDialog = useCallback(() => setDialog({ type: null }), [setDialog]);

  return (
    <>
      <CreateSaveDialog saves={saves} onClose={closeDialog} />
      <ConfirmSaveDialogs saves={saves} onClose={closeDialog} />
      <ImportSramDialog saves={saves} onClose={closeDialog} />
      <InvalidSramDialog saves={saves} onClose={closeDialog} />
    </>
  );
};

export { HomeTabDialogs };

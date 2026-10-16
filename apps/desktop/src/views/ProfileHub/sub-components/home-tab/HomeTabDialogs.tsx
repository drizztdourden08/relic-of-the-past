/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { ImportSramDialog } from './dialogs/ImportSramDialog';
import { InvalidSramDialog } from './dialogs/InvalidSramDialog';
import type { HomeTabDialogsProps } from './home-tab.type';
import './HomeTabDialogs.css';

const HomeTabDialogs = ({ saves }: HomeTabDialogsProps) => {
  const { setDialog } = saves;
  const closeDialog = useCallback(() => setDialog({ type: null }), [setDialog]);

  return (
    <>
      <ImportSramDialog saves={saves} onClose={closeDialog} />
      <InvalidSramDialog saves={saves} onClose={closeDialog} />
    </>
  );
};

export { HomeTabDialogs };

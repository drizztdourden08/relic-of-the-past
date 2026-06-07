/* @layer renderer-components @kind component */
/** Create / overwrite / delete confirmation dialogs for the Home tab. */
import { Dialog } from '../../../../composites/Dialog';
import type { HomeTabSaves } from './useHomeTabSaves';

const HomeTabDialogs = ({ saves }: { saves: HomeTabSaves }) => {
  const { dialog, setDialog, newSaveName, setNewSaveName, handleConfirmCreate, handleConfirmOverwrite, handleConfirmDelete } = saves;
  return (
    <>
      <Dialog
        open={dialog.type === 'create'}
        title="Create Save"
        message=""
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={handleConfirmCreate}
        onCancel={() => setDialog({ type: null })}
      >
        <input
          className="home-tab__save-name-input"
          value={newSaveName}
          onChange={(e) => setNewSaveName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmCreate(); }}
          placeholder="Save name..."
          maxLength={64}
          autoFocus
        />
      </Dialog>

      <Dialog
        open={dialog.type === 'overwrite'}
        title="Overwrite Save"
        message={`Overwrite "${dialog.targetName}"? This cannot be undone.`}
        confirmLabel="Overwrite"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmOverwrite}
        onCancel={() => setDialog({ type: null })}
      />

      <Dialog
        open={dialog.type === 'delete'}
        title="Delete Save"
        message={`Delete "${dialog.targetName}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDialog({ type: null })}
      />
    </>
  );
};

export { HomeTabDialogs };

/* @layer renderer-components @kind component */
/** Create / overwrite / delete confirmation dialogs for the Home tab. */
import { Dialog } from '../../../../../../design-system/composites/Dialog';
import { TextInput } from '../../../../../../design-system/primitives/TextInput';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Box } from '../../../../../../design-system/primitives/Box';
import type { HomeTabSaves } from './useHomeTabSaves';
import { IMPORT_CONFIRM_WORD } from './useHomeTabSramImport';
import './HomeTabDialogs.css';

const HomeTabDialogs = ({ saves }: { saves: HomeTabSaves }) => {
  const {
    dialog, setDialog, newSaveName, setNewSaveName, importConfirmText, setImportConfirmText,
    handleConfirmCreate, handleConfirmOverwrite, handleConfirmDelete,
    handleCancelImportSram, handleConfirmImportSram,
  } = saves;
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
        <TextInput
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

      <Dialog
        open={dialog.type === 'import-sram'}
        title="Import Save"
        message=""
        confirmLabel="Import"
        cancelLabel="Cancel"
        confirmDisabled={importConfirmText.trim().toLowerCase() !== IMPORT_CONFIRM_WORD}
        variant="danger"
        onConfirm={handleConfirmImportSram}
        onCancel={handleCancelImportSram}
      >
        <Box className="home-tab-dialogs__callout home-tab-dialogs__callout--ok">
          <Text as="span" className="home-tab-dialogs__callout-icon">✓</Text>
          <Text as="span">{dialog.detail}</Text>
        </Box>
        <Text as="p" className="home-tab-dialogs__warning">
          Replace this profile's save with <Text as="strong">"{dialog.targetName}"</Text>? The current
          in-game save is overwritten and this cannot be undone.
        </Text>
        <Text as="p" className="home-tab-dialogs__hint">
          Type <Text as="code" className="home-tab-dialogs__confirm-word">{IMPORT_CONFIRM_WORD}</Text> to confirm.
        </Text>
        <TextInput
          className="home-tab__import-confirm-input"
          value={importConfirmText}
          onChange={(e) => setImportConfirmText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && importConfirmText.trim().toLowerCase() === IMPORT_CONFIRM_WORD) handleConfirmImportSram(); }}
          placeholder={IMPORT_CONFIRM_WORD}
          autoFocus
        />
      </Dialog>

      <Dialog
        open={dialog.type === 'import-sram-invalid'}
        title="Not a Valid Save"
        message=""
        confirmLabel="OK"
        hideCancel
        onConfirm={() => setDialog({ type: null })}
        onCancel={() => setDialog({ type: null })}
      >
        <Box className="home-tab-dialogs__callout home-tab-dialogs__callout--bad">
          <Text as="span" className="home-tab-dialogs__callout-icon">⚠</Text>
          <Text as="span">{dialog.detail ?? 'That file is not a valid ALttP SRAM save.'}</Text>
        </Box>
      </Dialog>
    </>
  );
};

export { HomeTabDialogs };

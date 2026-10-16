/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { SaveList } from '@app/compounds/SaveList';
import { NO_GAME_REASON } from '../home-tab.constants';
import { undoKey } from '../undo/undo-key';
import { useRowSelection } from '../useRowSelection';
import type { HomeTabColumnsProps } from '../home-tab.type';
import { CreateSaveForm } from './CreateSaveForm';
import { NormalSaveRow } from './NormalSaveRow';
import { SectionHead } from './SectionHead';

const NormalSavesSection = (props: HomeTabColumnsProps) => {
  const { saves, isGameRunning } = props;
  const { normalSaves, undo, handleCreateNormalSave, handleDeleteNormal, handleRenameNormal } = saves;
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const ids = useMemo(
    () => normalSaves.filter((save) => undo.notices[undoKey('normal', save.id)] !== 'deleted').map((save) => save.id),
    [normalSaves, undo.notices],
  );
  const selection = useRowSelection(ids);

  const handleCreate = useCallback((name: string) => {
    setCreating(false);
    void handleCreateNormalSave(name).then((id) => { if (id) selection.select(id); });
  }, [handleCreateNormalSave, selection]);

  const handleRenameEnd = useCallback((id: string, name: string | null) => {
    setRenamingId(null);
    if (name !== null) void handleRenameNormal(id, name);
  }, [handleRenameNormal]);

  const handleOpenCreate = useCallback(() => setCreating(true), []);
  const handleCloseCreate = useCallback(() => setCreating(false), []);

  const createButton = (
    <Button
      variant="ghost"
      size="xs"
      icon={<Icon name="plus" />}
      onClick={handleOpenCreate}
      disabled={!isGameRunning || creating}
      title={isGameRunning ? undefined : NO_GAME_REASON}
    >
      New save
    </Button>
  );

  return (
    <Box as="section" className="home-tab__section">
      <SectionHead title="Saves" action={createButton} />
      {creating && isGameRunning && <CreateSaveForm onCreate={handleCreate} onCancel={handleCloseCreate} />}
      {normalSaves.length === 0 ? (
        <Text as="p" className="home-tab__empty">No saves yet</Text>
      ) : (
        <SaveList label="Saves" ids={ids} onSelect={selection.select} onDelete={handleDeleteNormal} onRename={setRenamingId} onUndo={undo.undoLatest}>
          {normalSaves.map((save) => (
            <NormalSaveRow
              key={save.id}
              {...props}
              save={save}
              selection={selection}
              renaming={renamingId === save.id}
              onStartRename={setRenamingId}
              onRenameEnd={handleRenameEnd}
            />
          ))}
        </SaveList>
      )}
    </Box>
  );
};

export { NormalSavesSection };

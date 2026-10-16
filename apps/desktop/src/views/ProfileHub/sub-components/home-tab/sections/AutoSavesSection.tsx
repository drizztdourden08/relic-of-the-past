/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { SaveList } from '@app/compounds/SaveList';
import { undoKey } from '../undo/undo-key';
import { useRowSelection } from '../useRowSelection';
import type { HomeTabColumnsProps } from '../home-tab.type';
import { AutoSaveRow } from './AutoSaveRow';
import { SectionHead } from './SectionHead';

const AutoSavesSection = (props: HomeTabColumnsProps) => {
  const { saves } = props;
  const { autoSaves, undo, handleDeleteAuto } = saves;
  const ids = useMemo(
    () => autoSaves.filter((save) => undo.notices[undoKey('auto', save.id)] !== 'deleted').map((save) => save.id),
    [autoSaves, undo.notices],
  );
  const selection = useRowSelection(ids);

  return (
    <Box as="section" className="home-tab__section">
      <SectionHead title="Auto-Saves" />
      {autoSaves.length === 0 ? (
        <Text as="p" className="home-tab__empty">No auto-saves yet</Text>
      ) : (
        <SaveList label="Auto-saves" ids={ids} onSelect={selection.select} onDelete={handleDeleteAuto} onUndo={undo.undoLatest}>
          {autoSaves.map((save) => <AutoSaveRow key={save.id} {...props} save={save} selection={selection} />)}
        </SaveList>
      )}
    </Box>
  );
};

export { AutoSavesSection };

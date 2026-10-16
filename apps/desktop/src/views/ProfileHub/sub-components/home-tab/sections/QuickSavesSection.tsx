/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { SaveList } from '@app/compounds/SaveList';
import { useRowSelection } from '../useRowSelection';
import type { HomeTabColumnsProps } from '../home-tab.type';
import { QuickSlotRow } from './QuickSlotRow';
import { SectionHead } from './SectionHead';

const QuickSavesSection = (props: HomeTabColumnsProps) => {
  const { saves } = props;
  const { slots, undo } = saves;
  const ids = useMemo(() => slots.map(({ slot }) => String(slot)), [slots]);
  const selection = useRowSelection(ids);

  return (
    <Box as="section" className="home-tab__section">
      <SectionHead title="Quick Saves" />
      <SaveList label="Quick saves" ids={ids} onSelect={selection.select} onUndo={undo.undoLatest}>
        {slots.map((info) => <QuickSlotRow key={info.slot} {...props} info={info} selection={selection} />)}
      </SaveList>
    </Box>
  );
};

export { QuickSavesSection };

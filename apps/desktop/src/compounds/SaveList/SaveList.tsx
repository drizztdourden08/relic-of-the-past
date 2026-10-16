/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { ListItemList } from '@drizztdourden08/tessera/composites';
import { ROW_SHAPE } from './SaveList.constants';
import { useSaveListKeys } from './behavior/useSaveListKeys';
import type { SaveListProps } from './SaveList.type';
import './SaveList.css';

const SaveList = (props: SaveListProps) => {
  const { label, children } = props;
  const listRef = useRef<HTMLElement>(null);
  const keys = useSaveListKeys(props, listRef);
  return (
    <Box ref={listRef} className="save-list" onKeyDown={keys.onKeyDown} onFocus={keys.onFocus}>
      <ListItemList label={label} shape={ROW_SHAPE}>{children}</ListItemList>
    </Box>
  );
};

export { SaveList };

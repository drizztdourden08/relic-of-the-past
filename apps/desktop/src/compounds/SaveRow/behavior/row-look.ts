/* @layer renderer-components @kind logic */
import type { SaveRowLook, SaveRowProps } from '../SaveRow.type';

const rowLook = (props: SaveRowProps): SaveRowLook => {
  const { busy = false, selected = false, notice, renaming = false } = props;
  return {
    className: busy ? 'save-row save-row--busy' : 'save-row',
    actionVisibility: selected || busy || notice ? 'always' : 'hover',
    clickable: !busy && !renaming,
  };
};

export { rowLook };

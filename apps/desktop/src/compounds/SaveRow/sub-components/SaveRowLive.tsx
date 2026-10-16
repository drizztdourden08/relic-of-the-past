/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { rowLook } from '../behavior/row-look';
import type { SaveRowProps } from '../SaveRow.type';
import { SaveRowEnd } from './SaveRowEnd';
import { SaveRowRename } from './SaveRowRename';
import { SaveRowThumb } from './SaveRowThumb';
import { SaveRowTime } from './SaveRowTime';

const SaveRowLive = (props: SaveRowProps) => {
  const { rowKey, name, timestamp, screenshotUrl, selected, tabIndex, renaming, onActivate, onRenameEnd } = props;
  const look = rowLook(props);
  const data = useMemo(() => ({ 'data-save-row': rowKey }), [rowKey]);
  return (
    <ListItemRow
      className={look.className}
      icon={<SaveRowThumb src={screenshotUrl} />}
      name={renaming && onRenameEnd ? <SaveRowRename name={name} onEnd={onRenameEnd} /> : name}
      meta={<SaveRowTime timestamp={timestamp} />}
      action={<SaveRowEnd {...props} />}
      actionVisibility={look.actionVisibility}
      selected={selected}
      tabIndex={tabIndex}
      onClick={look.clickable ? onActivate : undefined}
      data={data}
    />
  );
};

export { SaveRowLive };

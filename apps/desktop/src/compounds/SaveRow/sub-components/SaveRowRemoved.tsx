/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { NOTICE_LABELS } from '../SaveRow.constants';
import type { SaveRowRemovedProps } from '../SaveRow.type';
import { SaveRowNoticeLine } from './SaveRowNoticeLine';
import { SaveRowThumb } from './SaveRowThumb';

const SaveRowRemoved = ({ rowKey, name, screenshotUrl, notice }: SaveRowRemovedProps) => {
  const data = useMemo(() => ({ 'data-save-row': rowKey }), [rowKey]);
  return (
    <ListItemRow
      className="save-row save-row--removed"
      icon={<SaveRowThumb src={screenshotUrl} />}
      name={name}
      meta={NOTICE_LABELS[notice.kind]}
      action={<SaveRowNoticeLine notice={notice} />}
      data={data}
    />
  );
};

export { SaveRowRemoved };

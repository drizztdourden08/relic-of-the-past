/* @layer renderer-components @kind component */
import { Spinner } from '@drizztdourden08/tessera/primitives';
import type { SaveRowProps } from '../SaveRow.type';
import { SaveRowActions } from './SaveRowActions';
import { SaveRowNoticeLine } from './SaveRowNoticeLine';

const SaveRowEnd = (props: SaveRowProps) => {
  const { busy, notice, renaming, actions = [], tabIndex } = props;
  if (busy) return <Spinner size="sm" />;
  if (notice) return <SaveRowNoticeLine notice={notice} />;
  if (renaming || actions.length === 0) return null;
  return <SaveRowActions actions={actions} tabIndex={tabIndex} />;
};

export { SaveRowEnd };

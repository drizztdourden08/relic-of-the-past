/* @layer renderer-components @kind component */
import { SaveRowLive } from './sub-components/SaveRowLive';
import { SaveRowRemoved } from './sub-components/SaveRowRemoved';
import type { SaveRowProps } from './SaveRow.type';
import './SaveRow.css';

const SaveRow = (props: SaveRowProps) => {
  const { rowKey, name, screenshotUrl, notice } = props;
  if (notice?.kind === 'deleted') return <SaveRowRemoved rowKey={rowKey} name={name} screenshotUrl={screenshotUrl} notice={notice} />;
  return <SaveRowLive {...props} />;
};

export { SaveRow };

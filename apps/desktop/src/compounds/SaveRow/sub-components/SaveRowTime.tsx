/* @layer renderer-components @kind component */
import { Tooltip } from '@drizztdourden08/tessera/primitives';
import { EMPTY_LABEL, FULL_DATE_FORMAT } from '../SaveRow.constants';
import { relativeTime } from '../behavior/relative-time';
import type { SaveRowTimeProps } from '../SaveRow.type';

const SaveRowTime = ({ timestamp }: SaveRowTimeProps) => {
  if (timestamp === null) return EMPTY_LABEL;
  const full = new Date(timestamp).toLocaleString(undefined, FULL_DATE_FORMAT);
  return <Tooltip content={full}>{relativeTime(timestamp, Date.now())}</Tooltip>;
};

export { SaveRowTime };

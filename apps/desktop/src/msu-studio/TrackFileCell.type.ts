/* @layer renderer-components @kind types */
import type { TrackRowProps } from './msu.type';

type TrackFileCellProps = Pick<TrackRowProps, 'trackNum' | 'fileName' | 'fileSize' | 'options' | 'readOnly' | 'onAssign'>;

export type { TrackFileCellProps };

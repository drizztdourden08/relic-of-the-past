/* @layer renderer-components @kind types */
import type { SoundDetailProps } from './SoundDetail.type';

type SoundDetailHeadProps = Pick<
  SoundDetailProps,
  'channel' | 'row' | 'sound' | 'readOnly' | 'onPreview' | 'onPlayOriginal' | 'onStopReplacing' | 'onClose'
>;

export type { SoundDetailHeadProps };

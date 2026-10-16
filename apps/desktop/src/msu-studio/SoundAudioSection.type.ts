/* @layer renderer-components @kind types */
import type { SoundDetailProps } from './SoundDetail.type';

type SoundAudioSectionProps = Pick<SoundDetailProps, 'pack' | 'channel' | 'row' | 'sound' | 'manifest' | 'saveBase' | 'readOnly' | 'onReload'>;

export type { SoundAudioSectionProps };

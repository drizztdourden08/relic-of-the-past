/* @layer renderer-components @kind types */
import type { MsuStudioProps } from './MsuStudio.type';

type MsuMusicTabProps = Pick<MsuStudioProps, 'msu' | 'pack' | 'readOnly' | 'onDeleteConfirm'>;

export type { MsuMusicTabProps };

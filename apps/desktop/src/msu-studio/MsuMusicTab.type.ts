/* @layer renderer-components @kind types */
import type { TabPanelsProps } from './studio-frame/studio-frame.type';

type MsuMusicTabProps = Pick<TabPanelsProps, 'msu' | 'pack' | 'readOnly' | 'tabs' | 'packPanel' | 'onDeleteConfirm'>;

export type { MsuMusicTabProps };

/* @layer sanctuary-site @kind logic */
/**
 * The Sanctuary's one upload queue. It lives for the whole page, outside React, so an
 * upload keeps going while the member moves between pages; the tray, the dialog and the
 * Files page all read it.
 */
import { createUploadQueue } from '@site-kit/upload/upload-queue';
import { SANCTUARY_UPLOADER } from './sanctuary-uploader';

const SANCTUARY_QUEUE = createUploadQueue(SANCTUARY_UPLOADER);

type SanctuaryQueue = typeof SANCTUARY_QUEUE;

export { SANCTUARY_QUEUE };
export type { SanctuaryQueue };

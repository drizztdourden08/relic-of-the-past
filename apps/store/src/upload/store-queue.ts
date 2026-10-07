/* @layer store-site @kind logic */
/**
 * The store's one upload queue. It lives for the whole page, outside React, so a publish
 * keeps going while the author moves between pages; the tray, the dialog and the lists all
 * read it.
 */
import { createUploadQueue } from '@site-kit/upload/upload-queue';
import { STORE_UPLOADER } from './store-uploader';

const STORE_QUEUE = createUploadQueue(STORE_UPLOADER);

type StoreQueue = typeof STORE_QUEUE;

export { STORE_QUEUE };
export type { StoreQueue };

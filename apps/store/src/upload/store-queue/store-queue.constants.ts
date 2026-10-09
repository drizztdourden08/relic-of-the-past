/* @layer store-site @kind constants */
import { createUploadQueue } from '@site-kit/upload/upload-queue';
import { STORE_UPLOADER } from '../store-uploader/store-uploader.constants';

const STORE_QUEUE = createUploadQueue(STORE_UPLOADER);

export { STORE_QUEUE };

/* @layer sanctuary-site @kind logic */
import { createUploadQueue } from '@site-kit/upload/upload-queue';
import { SANCTUARY_UPLOADER } from './sanctuary-uploader.constants';

const sanctuaryQueue = createUploadQueue(SANCTUARY_UPLOADER);

export { sanctuaryQueue };

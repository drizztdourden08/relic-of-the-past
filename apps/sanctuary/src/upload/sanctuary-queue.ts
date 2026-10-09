/* @layer sanctuary-site @kind logic */
import { createUploadQueue } from '@rotp/hub-client';
import { SANCTUARY_UPLOADER } from './sanctuary-uploader.constants';

const sanctuaryQueue = createUploadQueue(SANCTUARY_UPLOADER);

export { sanctuaryQueue };

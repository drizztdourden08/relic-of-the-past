/* @layer renderer-lib @kind logic */
import { widgetBlobCache } from './widget-blob-cache';
import { writePending } from './write-pending';

const flushWidgetBlob = async (): Promise<void> => {
  writePending();
  await widgetBlobCache.inFlight;
};

export { flushWidgetBlob };

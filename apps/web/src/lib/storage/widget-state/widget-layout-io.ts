/* @layer renderer-lib @kind logic */
import type { TrackerStateBlob } from '../../tracker-state-io';
import { loadWidgetBlob } from './load-widget-blob';
import { patchWidgetBlob } from './patch-widget-blob';

const widgetLayoutIO = {
  load: (profileId: string): Promise<TrackerStateBlob | null> => loadWidgetBlob(profileId),
  save: (profileId: string, blob: TrackerStateBlob): Promise<void> => {
    patchWidgetBlob(profileId, blob);
    return Promise.resolve();
  },
};

export { widgetLayoutIO };

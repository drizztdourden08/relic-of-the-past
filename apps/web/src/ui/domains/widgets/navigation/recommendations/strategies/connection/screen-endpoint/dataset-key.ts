/* @layer renderer-widgets @kind logic */
import type { ConnectionRecord, ScreenId } from '@shared/game/data';
import { otherEndpoint } from './other-endpoint';

const datasetKey = (record: ConnectionRecord, screenId: ScreenId | null): string =>
  (screenId ? otherEndpoint(screenId, record) ?? record.id : record.id);

export { datasetKey };

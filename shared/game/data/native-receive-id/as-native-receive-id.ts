/* @layer shared-game @kind logic */
import { isNativeReceiveId } from './is-native-receive-id';

const asNativeReceiveId = (id: number | undefined): number | undefined =>
  (id !== undefined && isNativeReceiveId(id) ? id : undefined);

export { asNativeReceiveId };

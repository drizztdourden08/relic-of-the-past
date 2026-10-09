/* @layer shared-game @kind logic */
import { NATIVE_RECEIVE_TABLE_SIZE } from './native-receive-id.constants';

const isNativeReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= 0 && id < NATIVE_RECEIVE_TABLE_SIZE;

export { isNativeReceiveId };

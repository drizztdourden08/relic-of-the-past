/* @layer tests @kind helper */
import { stubLocalStorage } from '../ap-protocol-harness/stub-local-storage';
import { TRACE_UUID, UUID_STORAGE_KEY } from './online-trace.constants';

const stubTraceStorage = (): void => stubLocalStorage([[UUID_STORAGE_KEY, TRACE_UUID]]);

export { stubTraceStorage };

/* @layer tests @kind helper */
import { vi } from 'vitest';
import { TRACE_UUID, UUID_STORAGE_KEY } from './online-trace.constants';

const stubTraceStorage = (): void => {
  const store = new Map<string, string>([[UUID_STORAGE_KEY, TRACE_UUID]]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  });
};

export { stubTraceStorage };

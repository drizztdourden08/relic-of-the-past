/* @layer website-site @kind types */
type FetchState<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' };

export type { FetchState };

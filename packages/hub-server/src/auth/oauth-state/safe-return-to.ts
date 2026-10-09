/* @layer hub-core @kind logic */
const isSitePath = (raw: string): boolean => raw.startsWith('/') && !raw.startsWith('//');

const safeReturnTo = (raw: string | undefined): string => (raw && isSitePath(raw) ? raw : '/');

export { safeReturnTo };

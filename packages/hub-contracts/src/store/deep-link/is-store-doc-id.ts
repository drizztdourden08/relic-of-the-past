/* @layer shared-store @kind logic */
import { DOC_ID_RE, RESERVED_ID_RE } from './deep-link.constants';

const isStoreDocId = (value: string): boolean => DOC_ID_RE.test(value) && !RESERVED_ID_RE.test(value);

export { isStoreDocId };

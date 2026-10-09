/* @layer shared-storage @kind constants */
import { SET_FORMAT } from '../format-2';
import { SET_FILES } from '../paths';
import { payloadNames } from './payload-names';

const RLANG_EXTENSION = 'rlang';
const RLANG_HEADER_ENTRY = SET_FILES.meta;

const REQUIRED_PAYLOAD: readonly string[] = [SET_FILES.dialogue, SET_FILES.font, SET_FILES.fontWidth];

const ACCEPTED_PAYLOAD: ReadonlySet<string> = new Set([...payloadNames(1), ...payloadNames(SET_FORMAT)]);

export { RLANG_EXTENSION, RLANG_HEADER_ENTRY, REQUIRED_PAYLOAD, ACCEPTED_PAYLOAD };

/* @layer bridge-wasm @kind constants */
const MAX_SLOT_NAME_LENGTH = 16;

const FORBIDDEN_SLOT_CHARS = /[\p{Cc}{}]/u;

export { FORBIDDEN_SLOT_CHARS, MAX_SLOT_NAME_LENGTH };

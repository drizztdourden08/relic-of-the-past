/* @layer shared-hub @kind constants */
const TAG_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const MAX_TAGS = 12;
const MAX_TAG_CHARS = 32;
const MAX_VERSION_CHARS = 40;
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_ID_CHARS = 128;

export { ID_PATTERN, MAX_ID_CHARS, MAX_TAG_CHARS, MAX_TAGS, MAX_VERSION_CHARS, TAG_PATTERN };

/* @layer shared-store @kind constants */
import { STORE_LIMITS } from '../limits';

const MAX_NAME_CHARS = 60;
const MAX_SUMMARY_CHARS = 140;
const MAX_DESCRIPTION_CHARS = 8000;
const MAX_LICENSE_CHARS = 60;
const MAX_CHANGELOG_CHARS = 2000;
const MAX_REVIEW_NOTE_CHARS = 1000;
const MAX_WELCOME_CHARS = 4000;
const LARGEST_PACK = Math.max(...Object.values(STORE_LIMITS.packBytes));

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const MEDIA_KEY_PATTERN = /^media\/[A-Za-z0-9_-]{1,128}\/(card|banner)-[a-f0-9]{8}\.webp$/;

export {
  MAX_NAME_CHARS,
  MAX_SUMMARY_CHARS,
  MAX_DESCRIPTION_CHARS,
  MAX_LICENSE_CHARS,
  MAX_CHANGELOG_CHARS,
  MAX_REVIEW_NOTE_CHARS,
  MAX_WELCOME_CHARS,
  LARGEST_PACK,
  SHA256_PATTERN,
  MEDIA_KEY_PATTERN,
};

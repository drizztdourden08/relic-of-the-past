/* @layer renderer-components @kind logic */
/**
 * The convention check, kept deliberately thin.
 *
 * The house shape for a tag is `namespace:value`, so the built-in check asks
 * for exactly that and nothing more: a separator with something on either side.
 * It makes no assumption about the character set, because a collection with a
 * stricter idea of a legal value supplies its own `validate` instead of having
 * one baked in here.
 */
import type { TagAdvice, TagValidationResult, TagValidator } from '../TagInput.type';

const SEPARATOR = ':';
const DEFAULT_HINT = `Tags read namespace${SEPARATOR}value`;

const followsConvention = (tag: string): boolean => {
  const at = tag.indexOf(SEPARATOR);
  return at > 0 && at < tag.length - 1;
};

/**
 * Turns a validator's loose return into the one shape the UI renders. An empty
 * entry has nothing to advise about, so it always reads as fine.
 */
const adviseTag = (raw: string, validate?: TagValidator): TagAdvice => {
  const tag = raw.trim();
  if (!tag) return { ok: true, message: null };

  const verdict: TagValidationResult = validate
    ? validate(tag)
    : followsConvention(tag) || DEFAULT_HINT;

  if (verdict === true) return { ok: true, message: null };
  if (verdict === false) return { ok: false, message: null };
  return { ok: false, message: verdict };
};

interface BlockParams {
  raw: string;
  /** True when the vocabulary does not already hold this value. */
  isNew: boolean;
  /** Off by default — the advisory bargain stays the default everywhere. */
  enforce: boolean;
  validate?: TagValidator;
}

/**
 * Whether the typed entry must be REFUSED rather than merely flagged.
 *
 * Three things have to be true at once, and each one is load-bearing. Enforcing,
 * or the advice is advice. Brand new, because picking something the vocabulary
 * already holds is a pick and a pick is never refused — including a legacy value
 * that would fail the check today. And failing, obviously. Anything else commits.
 */
const blocksCreate = (params: BlockParams): boolean => {
  const { raw, isNew, enforce, validate } = params;
  return enforce && isNew && !adviseTag(raw, validate).ok;
};

export { adviseTag, blocksCreate, followsConvention, DEFAULT_HINT, SEPARATOR };
export type { BlockParams };

/* @layer renderer-components @kind data */
/**
 * The wording for the one layer edit that takes something away, kept beside the card so the
 * sentence the author reads under pressure can be corrected without stepping through a hook.
 *
 * The message names the file that survives and counts the ones that do not, because "the rest are
 * removed" is only answerable if you can see what "the rest" is.
 */

const SINGLE_DISCARD_TITLE = 'Keep One Track?';

const singleDiscardMessage = (files: string[]): string => {
  const dropped = files.length - 1;
  const plural = dropped === 1 ? 'file' : 'files';
  return `Single plays one track, repeating at its own loop point. "${files[0]}" is kept and the `
    + `other ${dropped} ${plural} are removed from this layer. Nothing is written until you save.`;
};

export { SINGLE_DISCARD_TITLE, singleDiscardMessage };

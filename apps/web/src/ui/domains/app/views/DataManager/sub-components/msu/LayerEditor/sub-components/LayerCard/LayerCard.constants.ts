/* @layer renderer-components @kind data */
// Names the surviving file and counts the dropped ones: "the rest are removed" needs a number.

const SINGLE_DISCARD_TITLE = 'Keep One Track?';

const singleDiscardMessage = (files: string[]): string => {
  const dropped = files.length - 1;
  const plural = dropped === 1 ? 'file' : 'files';
  return `Single plays one track, repeating at its own loop point. "${files[0]}" is kept and the `
    + `other ${dropped} ${plural} are removed from this layer. Nothing is written until you save.`;
};

export { SINGLE_DISCARD_TITLE, singleDiscardMessage };

/* @layer renderer-components @kind constants */
const MAX_CAPTION = 24;
const HEAD_CHARS = 12;
const TAIL_CHARS = 10;

const UNKNOWN_NAME = '-';

const FADE_MARK: Record<'in' | 'out', string> = { in: '(fade in)', out: '(fade out)' };

export { MAX_CAPTION, HEAD_CHARS, TAIL_CHARS, UNKNOWN_NAME, FADE_MARK };

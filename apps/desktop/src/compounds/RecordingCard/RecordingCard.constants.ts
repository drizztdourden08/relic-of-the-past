/* @layer renderer-components @kind constants */
const CYCLE_MS = 500;

const NO_FRAMES: string[] = [];

const SENT_LABEL = 'Sent';

const DELETE_LABEL = 'Delete recording';

const TIME_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };

export { CYCLE_MS, NO_FRAMES, SENT_LABEL, DELETE_LABEL, TIME_FORMAT };

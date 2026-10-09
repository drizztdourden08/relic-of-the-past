/* @layer renderer-components @kind constants */
const HINT = 'Get a mapping line from the SDL Gamepad Tool or a community controller database.';

const STATUS_TEXT: Record<'success' | 'error', string> = {
  success: 'Mapping added. The controller should pick it up now.',
  error: "That line wasn't recognized as a valid mapping.",
};

export { HINT, STATUS_TEXT };

/* @layer renderer-components @kind constants */
const TRAILING_VERB: Readonly<Record<string, string>> = {
  '+': 'Add the value it should add to.',
  '-': 'Add the value it should subtract.',
  '*': 'Add the value it should multiply by.',
  '/': 'Add the value it should divide by.',
  '%': 'Add the value it should divide by.',
  '^': 'Add the power it should raise to.',
};

const DISABLED = 'A formula reads values and produces a number; it never sets anything, and it has no lists.';

export { DISABLED, TRAILING_VERB };

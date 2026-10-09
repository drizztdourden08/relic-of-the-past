/* @layer renderer-components @kind logic */
const headTitle = (kind: string, index: number, text: string, empty: boolean): string =>
  `${kind} ${index} is ${text}${empty ? ' (empty, drawn at the 24px minimum)' : ''}`;

export { headTitle };

/* @layer renderer-components @kind logic */
const prefixAt = (text: string, caret: number): string =>
  (/([A-Za-z_]\w*)$/.exec(text.slice(0, caret))?.[1] ?? '');

export { prefixAt };

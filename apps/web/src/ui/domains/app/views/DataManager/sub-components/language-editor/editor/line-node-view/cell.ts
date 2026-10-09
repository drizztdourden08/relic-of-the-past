/* @layer renderer-components @kind logic */
const cell = (className: string): HTMLSpanElement => {
  const span = document.createElement('span');
  span.className = className;
  return span;
};

export { cell };

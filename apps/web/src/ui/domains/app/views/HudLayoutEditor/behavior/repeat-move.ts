/* @layer renderer-components @kind logic */
const repeatMove = (from: { clientX: number; clientY: number }): void => {
  window.dispatchEvent(new MouseEvent('pointermove', {
    bubbles: true, clientX: from.clientX, clientY: from.clientY,
  }));
};

export { repeatMove };

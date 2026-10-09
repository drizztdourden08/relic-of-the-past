/* @layer renderer-other @kind logic */
const applyNotchMode = (renderIntoNotch: boolean): void => {
  const root = document.documentElement;
  root.classList.toggle('notch-fill', renderIntoNotch);
  root.classList.toggle('notch-safe', !renderIntoNotch);
};

export { applyNotchMode };

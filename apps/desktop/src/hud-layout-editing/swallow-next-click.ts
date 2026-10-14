/* @layer renderer-components @kind logic */
const swallowNextClick = (): void => {
  const swallow = (event: MouseEvent): void => { event.stopPropagation(); event.preventDefault(); };
  window.addEventListener('click', swallow, { capture: true, once: true });
  setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
};

export { swallowNextClick };

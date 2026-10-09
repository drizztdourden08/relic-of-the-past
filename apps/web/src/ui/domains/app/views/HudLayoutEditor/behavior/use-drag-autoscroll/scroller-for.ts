/* @layer renderer-components @kind logic */
const scrollerFor = (element: HTMLElement | null): HTMLElement | null => {
  for (let node = element; node; node = node.parentElement) {
    if (node.scrollHeight - node.clientHeight > 1) return node;
  }
  return null;
};

export { scrollerFor };

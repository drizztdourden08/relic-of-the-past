/* @layer renderer-components @kind logic */
const rowRefFor = (rows: Map<string, HTMLElement>, id: string) => (el: HTMLElement | null): void => {
  if (el) rows.set(id, el);
  else rows.delete(id);
};

export { rowRefFor };

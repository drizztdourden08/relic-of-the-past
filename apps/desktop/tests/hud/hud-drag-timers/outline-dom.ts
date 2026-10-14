/* @layer tests @kind helper */
type Box = { top: number; bottom: number; left: number; right: number };

const rowsInOrder = (): HTMLElement[] =>
  Array.from(document.querySelectorAll('[data-outline-row]'));

const rect = (box: Box): DOMRect => ({
  x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top,
  top: box.top, left: box.left, right: box.right, bottom: box.bottom, toJSON: () => ({}),
});

const pointer = (type: string, y: number): MouseEvent =>
  new MouseEvent(type, { bubbles: true, cancelable: true, clientX: 40, clientY: y });

const rowFor = (id: string): HTMLElement => {
  const found = rowsInOrder().find((row) => row.dataset.outlineRow === id);
  if (!found) throw new Error(`no row for ${id}`);
  return found;
};

const outlineDom = { rowsInOrder, rect, pointer, rowFor };

export { outlineDom };

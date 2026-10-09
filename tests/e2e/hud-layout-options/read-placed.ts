/* @layer tests @kind helper */
const readPlaced = (): Record<string, number[]> => {
  const stage = document.querySelector('.hud-editor-stage');
  if (!stage) throw new Error('no stage');
  const base = stage.getBoundingClientRect();
  const out: Record<string, number[]> = {};
  for (const el of Array.from(stage.querySelectorAll('[data-node-id]'))) {
    const id = el.getAttribute('data-node-id') ?? '';
    const r = el.getBoundingClientRect();
    out[id] = [
      Math.round(r.left - base.left), Math.round(r.top - base.top),
      Math.round(r.width), Math.round(r.height),
    ];
  }
  return out;
};

export { readPlaced };

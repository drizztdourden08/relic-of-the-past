/* @layer tests @kind helper */
import type { Shape } from './hud-layout-options.type';

const readShape = (title: string): Shape => {
  const sections = Array.from(document.querySelectorAll('.hud-subsec'));
  const section = sections.find((s) => s.getAttribute('aria-label') === title);
  if (!section) throw new Error(`no section "${title}"`);
  const root = section.getBoundingClientRect();
  const nameOf = (el: Element): string => el.getAttribute('data-align')
    ?? el.getAttribute('data-action')
    ?? el.getAttribute('data-index')
    ?? el.getAttribute('data-engine')
    ?? el.getAttribute('aria-label')
    ?? (el.textContent ?? '').trim().slice(0, 24);
  const wanted = 'button, input, select, [role="group"], [role="listbox"], [role="grid"], [role="option"], [role="gridcell"], .hud-layout-set__piece, .hud-align__row, .hud-flex-strip__cell';
  const controls = Array.from(section.querySelectorAll(wanted)).map((el) => {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      name: nameOf(el),
      x: Math.round(r.left - root.left),
      y: Math.round(r.top - root.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  });
  const state = Array.from(section.querySelectorAll('[aria-pressed], [aria-selected], input, [data-state]'))
    .map((el) => `${nameOf(el)}=${el.getAttribute('aria-pressed')
      ?? el.getAttribute('aria-selected')
      ?? el.getAttribute('data-state')
      ?? (el as HTMLInputElement).value}`);
  return {
    controls,
    box: { w: Math.round(root.width), h: Math.round(root.height) },
    state,
  };
};

export { readShape };

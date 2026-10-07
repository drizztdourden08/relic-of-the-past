/* @layer tests @kind helper */
/**
 * THE BROWSER HALF of the Layout-section rig. `probe` is serialized by
 * `page.evaluate`, so it may close over NOTHING. Every constant it needs is
 * declared inside it, and that is why it is a file instead of a function in
 * `layout-bands.harness.ts`: pulling it out is the only way to keep either file
 * under the 200-line cap without condensing the assertions they exist to make.
 */
interface Box { h: number; top: number; bottom: number; left: number; right: number }

interface Measured {
  case: string;
  height: number;
  parts: Record<string, Box>;
  /** Every gap field, and every sub-section title in the case. */
  steps: Box[];
  /** Every labelled piece in section one, and every alignment tile row. */
  pieces: Box[];
  /** The label beside each section-one piece, in order. */
  labels: string[];
  tiles: Box[];
  titles: string[];
  /** The two `+`s and the last header on each axis, which §55 put "at the very end". */
  adds: Record<string, Box>;
  lastHeads: Record<string, Box>;
  /** Every box in the case that paints a background or draws a border, by class.
   *  It is the "stop putting container with border everywhere" evidence. */
  painted: string[];
  overflow: number;
}

const probe = (): Measured[] => {
  /** The boxes of the section's own chrome that §54 painted and §55 must not. */
  const OWN = ['hud-subsec', 'hud-subsec__body', 'hud-layout-set', 'hud-layout-set__piece',
    'hud-layout-set__gap', 'hud-layout-set__overlay', 'hud-align', 'hud-align__row',
    'hud-align__tiles', 'hud-engine-row', 'hud-grid', 'hud-layout-sections',
    'hud-inspect__group'];
  const round = (n: number): number => Math.round(n * 10) / 10;
  const names = ['hud-grid__bar', 'hud-grid__bar-chip', 'hud-grid__bar-hint',
    'hud-grid__legend', 'hud-align', 'hud-align__row', 'hud-align__tiles',
    'hud-layout-set', 'hud-layout-set__overlay', 'hud-engine-row',
    'hud-lattice__scroll', 'hud-subsec'];
  const out: Measured[] = [];
  for (const sec of Array.from(document.querySelectorAll('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    const boxOf = (el: Element): Box => {
      const r = el.getBoundingClientRect();
      return {
        h: round(r.height), top: round(r.top - rail.top),
        bottom: round(r.bottom - rail.top), left: round(r.left - rail.left),
        right: round(r.right - rail.left),
      };
    };
    const parts: Record<string, Box> = {};
    for (const name of names) {
      const el = sec.querySelector(`.${name}`);
      if (el) parts[name] = boxOf(el);
    }

    const adds: Record<string, Box> = {};
    const lastHeads: Record<string, Box> = {};
    for (const axis of ['columns', 'rows']) {
      const add = sec.querySelector(`.hud-lattice__add--${axis}`);
      if (add) adds[axis] = boxOf(add);
      const heads = Array.from(sec.querySelectorAll(axis === 'rows'
        ? '.hud-lattice__head--row' : '.hud-lattice__head:not(.hud-lattice__head--row)'));
      const last = heads[heads.length - 1];
      if (last) lastHeads[axis] = boxOf(last);
    }

    // A box "paints" if it has a non-transparent background or any visible
    // border. Only the section's OWN chrome is asked. Controls (buttons,
    // inputs, swatches, the lattice's cells) are meant to be drawn.
    const painted = OWN.flatMap((name) => Array.from(sec.querySelectorAll(`.${name}`))
      .filter((el) => {
        const cs = getComputedStyle(el);
        return !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor)
          || ['top', 'right', 'bottom', 'left']
            .some((side) => parseFloat(cs.getPropertyValue(`border-${side}-width`)) > 0);
      }).map(() => name));

    // The legend's cap strip is a deliberate sideways scroller, so what is inside
    // it is exempt; the strip itself is not.
    let overflow = 0;
    for (const el of Array.from(sec.querySelectorAll('*'))) {
      if (el.parentElement?.closest('.hud-grid__keys')) continue;
      overflow = Math.max(overflow, Math.round(el.getBoundingClientRect().right - rail.right));
    }
    out.push({
      case: (sec as HTMLElement).dataset.case ?? '?',
      height: round(sec.getBoundingClientRect().height),
      parts,
      steps: Array.from(sec.querySelectorAll('.hud-layout-set__gap')).map(boxOf),
      pieces: Array.from(sec.querySelectorAll('.hud-layout-set > .hud-layout-set__piece')).map(boxOf),
      labels: Array.from(sec.querySelectorAll('.hud-layout-set > .hud-layout-set__piece'))
        .map((el) => el.querySelector('.hud-layout-set__label')?.textContent ?? '?'),
      tiles: Array.from(sec.querySelectorAll('.hud-align__diagram')).map(boxOf),
      titles: Array.from(sec.querySelectorAll('.hud-subsec__title'))
        .map((el) => el.textContent ?? ''),
      adds,
      lastHeads,
      painted: [...new Set(painted)].sort(),
      overflow,
    });
  }
  return out;
};

/**
 * THE RAILS THAT EXIST. 188 was measured from §34 to §54 and has not been
 * reachable since the rails became draggable: `PANEL_MIN_WIDTH` is 220, so the
 * inspector cannot be made narrower than that by any gesture. Measuring a width
 * the UI refuses to produce is how §54 came to record a wrap nobody could see;
 * 220 is the real floor, 232 the brief's narrow case, 320 the default.
 */

export { probe };
export type { Box, Measured };

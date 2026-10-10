/* @layer tests @kind helper */
import type { Box, Measured } from './layout-bands.type';

const probe = (): Measured[] => {
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

    const painted = OWN.flatMap((name) => Array.from(sec.querySelectorAll(`.${name}`))
      .filter((el) => {
        const cs = getComputedStyle(el);
        return !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor)
          || ['top', 'right', 'bottom', 'left']
            .some((side) => parseFloat(cs.getPropertyValue(`border-${side}-width`)) > 0);
      }).map(() => name));

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

export { probe };

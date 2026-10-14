/* @layer tests @kind helper */
import type { Box, Measured } from './layout-bands.type';

type Geometry = Pick<Measured, 'case' | 'height' | 'parts' | 'steps' | 'pieces' | 'labels' | 'tiles' | 'titles' | 'overflow'>;
type Tracks = Pick<Measured, 'case' | 'adds' | 'lastHeads'>;
type Paint = Pick<Measured, 'case' | 'painted'>;

const geometryProbe = (): Geometry[] => {
  const round = (n: number): number => Math.round(n * 10) / 10;
  const names = ['hud-grid__bar', 'hud-grid__bar-chip', 'hud-grid__bar-hint',
    'hud-grid__legend', 'hud-align', 'hud-align__row', 'hud-align__tiles',
    'hud-layout-set', 'hud-layout-set__overlay', 'hud-engine-row',
    'hud-lattice__scroll', 'hud-subsec'];
  const out: Geometry[] = [];
  for (const sec of Array.from(document.querySelectorAll<HTMLElement>('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    const boxOf = (el: Element): Box => {
      const r = el.getBoundingClientRect();
      return {
        h: round(r.height), top: round(r.top - rail.top),
        bottom: round(r.bottom - rail.top), left: round(r.left - rail.left),
        right: round(r.right - rail.left),
      };
    };
    const overflowOf = (): number => Array.from(sec.querySelectorAll('*'))
      .filter((el) => !el.parentElement?.closest('.hud-grid__keys'))
      .reduce((most, el) => Math.max(most, Math.round(el.getBoundingClientRect().right - rail.right)), 0);
    const parts: Record<string, Box> = {};
    for (const name of names) {
      const el = sec.querySelector(`.${name}`);
      if (el) parts[name] = boxOf(el);
    }
    out.push({
      case: sec.dataset.case ?? '?',
      height: round(sec.getBoundingClientRect().height),
      parts,
      steps: Array.from(sec.querySelectorAll('.hud-layout-set__gap')).map(boxOf),
      pieces: Array.from(sec.querySelectorAll('.hud-layout-set > .hud-layout-set__piece')).map(boxOf),
      labels: Array.from(sec.querySelectorAll('.hud-layout-set > .hud-layout-set__piece'))
        .map((el) => el.querySelector('.hud-layout-set__label')?.textContent ?? '?'),
      tiles: Array.from(sec.querySelectorAll('.hud-align__diagram')).map(boxOf),
      titles: Array.from(sec.querySelectorAll('.hud-subsec__title')).map((el) => el.textContent),
      overflow: overflowOf(),
    });
  }
  return out;
};

const tracksProbe = (): Tracks[] => {
  const round = (n: number): number => Math.round(n * 10) / 10;
  const out: Tracks[] = [];
  for (const sec of Array.from(document.querySelectorAll<HTMLElement>('[data-case]'))) {
    const rail = sec.getBoundingClientRect();
    const boxOf = (el: Element): Box => {
      const r = el.getBoundingClientRect();
      return {
        h: round(r.height), top: round(r.top - rail.top),
        bottom: round(r.bottom - rail.top), left: round(r.left - rail.left),
        right: round(r.right - rail.left),
      };
    };
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
    out.push({ case: sec.dataset.case ?? '?', adds, lastHeads });
  }
  return out;
};

const paintProbe = (): Paint[] => {
  const OWN = ['hud-subsec', 'hud-subsec__body', 'hud-layout-set', 'hud-layout-set__piece',
    'hud-layout-set__gap', 'hud-layout-set__overlay', 'hud-align', 'hud-align__row',
    'hud-align__tiles', 'hud-engine-row', 'hud-grid', 'hud-layout-sections',
    'hud-inspect__group'];
  const isPainted = (el: Element): boolean => {
    const cs = getComputedStyle(el);
    return !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor)
      || ['top', 'right', 'bottom', 'left']
        .some((side) => parseFloat(cs.getPropertyValue(`border-${side}-width`)) > 0);
  };
  return Array.from(document.querySelectorAll<HTMLElement>('[data-case]')).map((sec) => {
    const painted = OWN.flatMap((name) => Array.from(sec.querySelectorAll(`.${name}`))
      .filter(isPainted).map(() => name));
    return { case: sec.dataset.case ?? '?', painted: [...new Set(painted)].sort() };
  });
};

const probes = { geometry: geometryProbe, tracks: tracksProbe, paint: paintProbe };

export { probes };

/* @layer tests @kind helper */
import type { Cells, Frozen, Heads, Read, Scroller } from './metrics.type';

type Painted = { cells: Cells[]; paint: Record<string, string> };

const cellsProbe = (): Painted => {
  const round = (n: number): number => Math.round(n * 10) / 10;
  const cells: Cells[] = [];
  const paint: Record<string, string> = {};
  for (const sec of Array.from(document.querySelectorAll<HTMLElement>('[data-case]'))) {
    for (const el of Array.from(sec.querySelectorAll<HTMLElement>('.hud-lattice__cell'))) {
      const box = el.getBoundingClientRect();
      const { column, row, state = '?' } = el.dataset;
      cells.push({
        case: sec.dataset.case ?? '?', column: Number(column), row: Number(row),
        x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height),
      });
      const css = getComputedStyle(el);
      paint[state] ??= `${css.backgroundColor} | ${css.backgroundImage}`;
    }
  }
  return { cells, paint };
};

const headsProbe = (): Heads[] => {
  const round = (n: number): number => Math.round(n * 10) / 10;
  const heads: Heads[] = [];
  for (const sec of Array.from(document.querySelectorAll<HTMLElement>('[data-case]'))) {
    for (const el of Array.from(sec.querySelectorAll<HTMLElement>('.hud-lattice__head'))) {
      const box = el.getBoundingClientRect();
      const label = el.getAttribute('aria-label') ?? '';
      heads.push({
        case: sec.dataset.case ?? '?', axis: label.startsWith('column') ? 'columns' : 'rows',
        index: Number(label.split(' ')[1]), empty: el.dataset.empty === 'true',
        x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height),
      });
    }
  }
  return heads;
};

const scrollProbe = (): Scroller[] => {
  const scroll: Scroller[] = [];
  for (const sec of Array.from(document.querySelectorAll<HTMLElement>('[data-case]'))) {
    for (const el of Array.from(sec.querySelectorAll('.hud-lattice__scroll'))) {
      scroll.push({
        case: sec.dataset.case ?? '?',
        scrollW: el.scrollWidth, clientW: el.clientWidth, scrollH: el.scrollHeight, clientH: el.clientHeight,
      });
    }
  }
  return scroll;
};

const frozenProbe = (): Read['frozen'] => {
  const round = (n: number): number => Math.round(n * 10) / 10;
  const port = document.querySelector('[data-case="twelve"] .hud-lattice__scroll');
  if (!port) throw new Error('the twelve-track case has no scroller');
  const rowHead = port.querySelector('.hud-lattice__head--row');
  const colHead = port.querySelector('.hud-lattice__head:not(.hud-lattice__head--row)');
  if (!rowHead || !colHead) throw new Error('the twelve-track case has no frozen headers');
  const frozenNow = (): Frozen => {
    const view = port.getBoundingClientRect();
    return {
      rowHeadOffset: round(rowHead.getBoundingClientRect().left - view.left),
      colHeadOffset: round(colHead.getBoundingClientRect().top - view.top),
      sticky: getComputedStyle(rowHead).position,
    };
  };
  const before = frozenNow();
  port.scrollLeft = 120;
  port.scrollTop = 60;
  return { before, after: frozenNow() };
};

const echoProbe = (): Read['echo'] => {
  const round = (n: number): number => Math.round(n * 10) / 10;
  const echoBox = document.querySelector('[data-case="echo"] .hud-grid-echo')?.getBoundingClientRect();
  const stage = document.querySelector('.echo-stage')?.getBoundingClientRect();
  if (!echoBox || !stage) return null;
  return {
    x: round(echoBox.left - stage.left), y: round(echoBox.top - stage.top),
    w: round(echoBox.width), h: round(echoBox.height),
  };
};

const probes = { cells: cellsProbe, heads: headsProbe, scroll: scrollProbe, frozen: frozenProbe, echo: echoProbe };

export { probes };

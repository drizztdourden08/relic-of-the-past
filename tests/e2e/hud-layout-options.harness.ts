/* @layer tests @kind helper */
/**
 * THE RIG FOR "PRESS EVERY OPTION AND LOOK" (§58). It drives the built app under
 * Playwright's `_electron` the way a person drives it.
 *
 * WHY IT EXISTS. Six passes at this panel passed every gate and were rejected,
 * because every gate measured the panel at REST. The maintainer's rule is about
 * what happens when you PRESS something:
 *
 * > "NOTHING IN A FUCKING SECTION SHOULD CHANGE WHEN CLICKING ANY FUCKING OTHER
 * > OPTION IN THAT SAME FUCKING SECTION! [...] TEST EVERY FUCKING OPTION by hand,
 * > one by one, and check the result in the layout after changing it"
 *
 * So the rig does exactly two things, and they are the two halves of the rule:
 * `sectionShape` reads every control in one section as a list of tags, names and
 * rectangles, and `placedRects` reads every node's placed box off the stage.
 * Press an option, and the first must be unchanged while the second must not be.
 *
 * IT NEVER TOUCHES THE MAINTAINER'S SESSION (rule zero-B): its own `--instance`,
 * its own COPY of `.user-data` at a short path, `--no-focus --muted`, and
 * nothing is ever saved, because every run closes the draft and walks away.
 */
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { ElectronApplication, Page } from 'playwright';

const PROJECT_ROOT = join(__dirname, '..', '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');
/** A COPY, at a short path, because a long one breaks `app-sprite://`. */
const USER_DATA = 'C:\\Users\\drizz\\AppData\\Local\\Temp\\rotp-pr';
const SHOTS = join(PROJECT_ROOT, 'tests', 'screenshots', 'layout-options');

const built = (): boolean => existsSync(MAIN_JS);

/** One control, as the rule cares about it: what it is, what it is called, and
 *  where it sits. Deliberately WITHOUT its own lit/checked/value state, which is
 *  the one thing an option is allowed to change about itself. */
interface Control {
  tag: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Shape {
  /** Every control in the section, in document order. */
  controls: Control[];
  /** The section's own box. A section that grows a row has changed too. */
  box: { w: number; h: number };
  /** Which controls are lit/checked/valued, so a test can prove the option's
   *  OWN state moved while everything else held still. */
  state: string[];
}

/** Runs in the page. Kept as one self-contained function: `page.evaluate` does
 *  not carry a closure. */
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

/** Every node's placed rectangle, at the display scale, keyed by id. */
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

/**
 * WHAT THE OVERLAY IS DRAWING RIGHT NOW. It is the toggle's own visible effect,
 * and the only honest way to watch a GRID's gap move.
 *
 * A gap between two `auto` columns either side of a `fill` one changes the fill
 * track's width and NOT one child rectangle: the outer bands still hug their
 * corners. The cell BOUNDARIES do move, they come straight out of the engine's
 * track solve (`stageCellRects`), and the overlay is where they are visible, so
 * the line positions are the rectangles this option is judged by.
 */
const readOverlay = (): { lines: number; slots: number; color: string; xs: number[]; ys: number[] } => {
  const stage = document.querySelector('.hud-editor-stage');
  const base = stage ? stage.getBoundingClientRect() : new DOMRect();
  const at = (sel: string, side: 'left' | 'top'): number[] =>
    Array.from(document.querySelectorAll(sel)).map((el) => {
      const r = el.getBoundingClientRect();
      return Math.round(side === 'left' ? r.left - base.left : r.top - base.top);
    });
  // A GRID'S LINE PAINTS ITS `background`, A FLEX SLOT ITS `border`. Reading
  // whichever happens to be set would answer with the inherited text colour.
  const slot = document.querySelector('.hud-overlay__slot');
  const line = document.querySelector('.hud-overlay__line');
  return {
    lines: document.querySelectorAll('.hud-overlay__line').length,
    slots: document.querySelectorAll('.hud-overlay__slot').length,
    color: slot
      ? getComputedStyle(slot).borderColor
      : (line ? getComputedStyle(line).backgroundColor : ''),
    xs: at('.hud-overlay__line--v', 'left'),
    ys: at('.hud-overlay__line--h', 'top'),
  };
};

/**
 * THE LATTICE AS A STRUCTURE: every header's printed size, and which cell each
 * child's label is drawn over.
 *
 * A TRACK EDIT IS A DOCUMENT CHANGE BEFORE IT IS A PIXEL. Inserting an empty
 * `auto` column moves nothing on the stage, because an empty `auto` track solves
 * to zero width. It DOES renumber every child to its right, which is §50's
 * "children are kept valid automatically" and is exactly what the drawing
 * shows. So an insert is judged by the occupancy map it rewrites.
 */
const readLattice = (): { heads: string[]; occupants: Record<string, string> } => {
  const heads = Array.from(document.querySelectorAll('.hud-lattice__head'))
    .map((el) => (el.textContent ?? '').trim());
  const occupants: Record<string, string> = {};
  for (const el of Array.from(document.querySelectorAll('.hud-lattice__occupant'))) {
    const style = (el as HTMLElement).style;
    occupants[(el.textContent ?? '').trim()] = `${style.gridColumn}/${style.gridRow}`;
  }
  return { heads, occupants };
};

interface Rig {
  app: ElectronApplication;
  window: Page;
  shape: (title: string) => Promise<Shape>;
  placed: () => Promise<Record<string, number[]>>;
  overlay: () => Promise<{ lines: number; slots: number; color: string; xs: number[]; ys: number[] }>;
  lattice: () => Promise<{ heads: string[]; occupants: Record<string, string> }>;
  pick: (id: string) => Promise<void>;
  shoot: (name: string) => Promise<void>;
  close: () => Promise<void>;
}

const open = async (): Promise<Rig> => {
  mkdirSync(SHOTS, { recursive: true });
  const app = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', '--instance=layout-options', `--user-data=${USER_DATA}`],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  await window.waitForSelector('.titlebar', { timeout: 60_000 });
  // A TALL VIEWPORT, so a whole section fits one capture. `element.screenshot`
  // paints black wherever the element runs past the viewport.
  const cdp = await app.context().newCDPSession(window);
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1500, height: 1750, deviceScaleFactor: 1, mobile: false,
  });
  await window.click('[aria-label="Menu"]');
  await window.click('text=Advanced');
  await window.click('text=HUD Layout Editor');
  await window.waitForSelector('.hud-editor', { timeout: 30_000 });
  await window.waitForTimeout(1000);

  const settle = async (): Promise<void> => { await window.waitForTimeout(260); };

  return {
    app,
    window,
    shape: async (title) => {
      await settle();
      return window.evaluate(readShape, title);
    },
    placed: async () => {
      await settle();
      return window.evaluate(readPlaced);
    },
    overlay: async () => {
      await settle();
      return window.evaluate(readOverlay);
    },
    lattice: async () => {
      await settle();
      return window.evaluate(readLattice);
    },
    pick: async (id) => {
      await window.locator('.hud-outline__row', { hasText: id }).first().click();
      await window.waitForTimeout(400);
      const head = window.locator('.hud-section__head', { hasText: 'Layout' }).first();
      if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click();
      await window.waitForTimeout(400);
    },
    shoot: async (name) => {
      await window.locator('.hud-editor__body').screenshot({ path: join(SHOTS, `${name}.png`) });
    },
    close: async () => { await app.close().catch(() => { /* already gone */ }); },
  };
};

export { SHOTS, built, open, readLattice, readOverlay, readPlaced, readShape };
export type { Control, Rig, Shape };

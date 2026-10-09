/* @layer tests @kind helper */
import type { Lattice } from './hud-layout-options.type';

const readLattice = (): Lattice => {
  const heads = Array.from(document.querySelectorAll('.hud-lattice__head'))
    .map((el) => (el.textContent ?? '').trim());
  const occupants: Record<string, string> = {};
  for (const el of Array.from(document.querySelectorAll('.hud-lattice__occupant'))) {
    const style = (el as HTMLElement).style;
    occupants[(el.textContent ?? '').trim()] = `${style.gridColumn}/${style.gridRow}`;
  }
  return { heads, occupants };
};

export { readLattice };

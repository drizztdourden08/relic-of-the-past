/* @layer tests @kind type */
import type { ElectronApplication, Page } from 'playwright';

interface Control {
  tag: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Shape {
  controls: Control[];
  box: { w: number; h: number };
  state: string[];
}

type Overlay = { lines: number; slots: number; color: string; xs: number[]; ys: number[] };

type Lattice = { heads: string[]; occupants: Record<string, string> };

interface Rig {
  app: ElectronApplication;
  window: Page;
  shape: (title: string) => Promise<Shape>;
  placed: () => Promise<Record<string, number[]>>;
  overlay: () => Promise<Overlay>;
  lattice: () => Promise<Lattice>;
  pick: (id: string) => Promise<void>;
  shoot: (name: string) => Promise<void>;
  close: () => Promise<void>;
}

export type { Control, Lattice, Overlay, Rig, Shape };

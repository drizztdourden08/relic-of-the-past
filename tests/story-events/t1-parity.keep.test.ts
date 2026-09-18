/* @layer test @kind spec */
/**
 * Byte parity with the master core: with every story field at zero, the core in this checkout
 * and a baseline core built from master produce identical WRAM after the same scripted input,
 * on every save-state fixture. The claim behind every gate: off, nothing observable changed.
 *
 * The baseline core is built out of band and skipped when absent: point ROTP_BASELINE_WASM_JS
 * at a master build's zelda3.js, or build one into .user-data/baseline-core with
 *   git archive origin/master core scripts/ensure-wasm.mjs package.json | tar -x -C .user-data/baseline-core
 *   node scripts/ensure-wasm.mjs   (run inside that folder, with the emsdk environment active)
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { Core, ROOT, fixtureNames } from './core-harness';
import type { Step } from './core-harness';

const NEW_JS = resolve(ROOT, 'apps/web/public/wasm/zelda3.js');
const BASE_JS = process.env.ROTP_BASELINE_WASM_JS ?? resolve(ROOT, '.user-data/baseline-core/apps/web/public/wasm/zelda3.js');

/** Idle, walk, act, idle: enough to cross a transition on most fixtures. */
const SCRIPT: readonly Step[] = [
  { hold: [], frames: 120 },
  { hold: ['Up'], frames: 90 },
  { hold: ['A'], frames: 20 },
  { hold: [], frames: 60 },
  { hold: ['Down'], frames: 60 },
  { hold: ['B'], frames: 10 },
  { hold: [], frames: 120 },
];

const ready = existsSync(NEW_JS) && existsSync(BASE_JS);
const describeCore = ready ? describe : describe.skip;

describeCore('T1: gate off matches the master core byte for byte', () => {
  let fresh: Core;
  let base: Core;

  beforeAll(async () => {
    fresh = await Core.load(NEW_JS, 'new');
    base = await Core.load(BASE_JS, 'master');
  }, 120_000);

  for (const name of fixtureNames()) {
    it(`fixture ${name}`, () => {
      for (const core of [fresh, base]) {
        core.loadFixture(name);
        core.setGateWord(5, 0);
      }
      expect(fresh.hash()).toBe(base.hash());
      const loaded = fresh.hash();
      const frameBefore = fresh.get8(0x1a);
      for (const step of SCRIPT) {
        fresh.play([step]);
        base.play([step]);
        if (fresh.hash() !== base.hash()) {
          const at = Core.firstDiff(fresh, base);
          throw new Error(`${name}: diverged at WRAM 0x${at?.toString(16)} after holding [${step.hold.join(',')}] for ${step.frames} frames`);
        }
      }
      expect(fresh.sramHash()).toBe(base.sramHash());
      // The script must have run: the frame counter moved and the world is not the loaded state.
      expect(fresh.get8(0x1a)).not.toBe(frameBefore);
      expect(fresh.hash()).not.toBe(loaded);
    });
  }
});

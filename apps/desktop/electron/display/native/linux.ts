/* @layer electron-main @kind logic */
/**
 * Linux refresh-rate driver, via the xrandr CLI.
 *
 * No FFI on purpose: xrandr ships with every X11 desktop, and libXrandr's soname varies
 * by distribution.
 *
 * Wayland is the limitation: xrandr either reports nothing or only sees XWayland, so an
 * empty rate list is returned and the setting reports itself unavailable. Per-compositor
 * tools (wlr-randr, kscreen-doctor) would each need their own driver.
 *
 * NOT VERIFIED ON HARDWARE. Needs a pass in the Linux VM.
 */
import { execFileSync } from 'node:child_process';
import type { DisplayModeDriver } from './types';

interface XrandrState {
  output: string;
  resolution: string;
  rates: number[];
  currentRate: number | null;
}

const runXrandr = (args: string[]): string | null => {
  try {
    return execFileSync('xrandr', args, { encoding: 'utf8', timeout: 4000, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
};

/**
 * Parse `xrandr` for the connected output's current mode and its available rates.
 *
 * The format lists an output line, then indented mode lines whose rates carry markers:
 *   DP-1 connected primary 2560x1440+0+0 ...
 *      2560x1440    143.97*+ 120.00   99.95    59.95
 * `*` marks the active rate and `+` the preferred one, so both are stripped before parsing.
 */
const readState = (): XrandrState | null => {
  const out = runXrandr([]);
  if (!out) return null;

  const lines = out.split('\n');
  let output = '';
  let resolution = '';
  let currentRate: number | null = null;
  const rates: number[] = [];
  let inActiveOutput = false;

  for (const line of lines) {
    const connected = /^(\S+)\s+connected\s+(?:primary\s+)?(\d+x\d+)/.exec(line);
    if (connected) {
      // Stop at the first connected output that has a geometry, which is the one in use.
      if (output) break;
      output = connected[1];
      resolution = connected[2];
      inActiveOutput = true;
      continue;
    }
    if (/^\S/.test(line)) {
      // A new unindented line ends the mode block for the output we were reading.
      if (inActiveOutput && output) inActiveOutput = false;
      continue;
    }
    if (!inActiveOutput || !resolution) continue;

    const mode = /^\s+(\d+x\d+)\s+(.*)$/.exec(line);
    if (!mode || mode[1] !== resolution) continue;
    for (const token of mode[2].trim().split(/\s+/)) {
      const active = token.includes('*');
      const hz = Number.parseFloat(token.replace(/[*+]/g, ''));
      if (!Number.isFinite(hz) || hz <= 0) continue;
      rates.push(Math.round(hz));
      if (active) currentRate = Math.round(hz);
    }
  }

  if (!output || !resolution) return null;
  return { output, resolution, rates: [...new Set(rates)].sort((a, b) => a - b), currentRate };
};

const listRates = (): number[] => readState()?.rates ?? [];

const currentRate = (): number | null => readState()?.currentRate ?? null;

const setRate = (hz: number): boolean => {
  const state = readState();
  if (!state) return false;
  const result = runXrandr(['--output', state.output, '--mode', state.resolution, '--rate', String(hz)]);
  if (result === null) return false;
  // xrandr exits 0 even when a rate is silently rounded, so confirm by reading back.
  return currentRate() === hz;
};

const createLinuxDriver = (): DisplayModeDriver => {
  // Probing once at construction also tells us whether we are on a session xrandr can see.
  const probe = readState();
  const ready = probe !== null && probe.rates.length > 0;
  return {
    platform: 'linux',
    available: ready,
    unavailableReason: ready
      ? ''
      : 'xrandr could not read this display, which usually means a Wayland session instead of X11',
    listRates,
    currentRate,
    setRate,
  };
};

export { createLinuxDriver };

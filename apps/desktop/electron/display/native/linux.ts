/* @layer electron-main @kind logic */
import { execFileSync } from 'node:child_process';
import type { DisplayModeDriver } from './display-mode-driver.type';
import type { XrandrState } from './linux.type';

const runXrandr = (args: string[]): string | null => {
  try {
    return execFileSync('xrandr', args, { encoding: 'utf8', timeout: 4000, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
};

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
      if (output) break;
      output = connected[1];
      resolution = connected[2];
      inActiveOutput = true;
      continue;
    }
    const isUnindented = /^\S/.test(line);
    if (isUnindented) {
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
  const rateReadBack = currentRate();
  return rateReadBack === hz;
};

const createLinuxDriver = (): DisplayModeDriver => {
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

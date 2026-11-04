/* @layer tests @kind helper */
const traceState = { stamp: '', lines: [] as string[] };

const record = (channel: string, level: string) => (message: string, given?: string): void => {
  traceState.lines.push(`${traceState.stamp}${channel} ${given ?? level}: ${message}`);
};

const traceLog = {
  core: record('core', 'info'),
  app: record('app', 'info'),
  randomizer: record('randomizer', 'info'),
  wasm: record('wasm', 'info'),
  ipc: record('ipc', 'info'),
  sim: record('sim', 'info'),
  error: (message: string): void => { traceState.lines.push(`${traceState.stamp}error error: ${message}`); },
};

const setStamp = (stamp: string): void => { traceState.stamp = stamp; };

const takeLines = (): string[] => traceState.lines.splice(0);

export { setStamp, takeLines, traceLog };

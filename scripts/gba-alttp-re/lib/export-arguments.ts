/* @layer scripts @kind tooling */
/** Command-line arguments for export-palace-dungeon.ts. */

interface CliArguments {
  rom?: string;
  /** The base cartridge. The supplement is compiled against it, so it has no default. */
  snes?: string;
  out?: string;
  'allow-unknown-rom'?: boolean;
}

const parseArguments = (): CliArguments => {
  const result: CliArguments = {};
  const values = process.argv.slice(2);
  for (let i = 0; i < values.length; i++) {
    const key = values[i];
    if (!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`);
    if (key === '--allow-unknown-rom') {
      result['allow-unknown-rom'] = true;
      continue;
    }
    const value = values[++i];
    if (!value) throw new Error(`Missing value for ${key}`);
    if (key === '--rom') result.rom = value;
    else if (key === '--snes') result.snes = value;
    else if (key === '--out') result.out = value;
    else throw new Error(`Unknown argument: ${key}`);
  }
  return result;
};

export { parseArguments };
export type { CliArguments };

/* @layer scripts @kind data */
const VALUE_KEYS: Readonly<Partial<Record<string, 'rom' | 'snes' | 'out'>>> = {
  '--rom': 'rom',
  '--snes': 'snes',
  '--out': 'out',
};

export { VALUE_KEYS };

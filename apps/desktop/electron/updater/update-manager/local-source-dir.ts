/* @layer electron-main @kind logic */
const localSourceDir = (): string | null => {
  const arg = process.argv.find((a) => a.startsWith('--update-source='));
  return arg ? arg.slice('--update-source='.length) : null;
};

export { localSourceDir };

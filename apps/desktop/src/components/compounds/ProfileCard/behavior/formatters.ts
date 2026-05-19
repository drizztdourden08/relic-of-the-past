const formatDate = (ts: number): string => {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const formatRomName = (romFile: string): string => {
  return romFile.replace(/\.(sfc|smc)$/i, '');
};

export { formatDate, formatRomName };

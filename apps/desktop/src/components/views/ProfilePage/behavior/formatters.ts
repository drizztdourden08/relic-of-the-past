const formatDate = (ts: number): string => {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatRomName = (romFile: string): string => {
  return romFile.replace(/\.(sfc|smc)$/i, '');
};

export { formatDate, formatRomName };

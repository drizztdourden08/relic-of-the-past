/* @layer renderer-hud @kind logic */
const sourceLabel = (source: string): string => {
  if (source.includes(':')) return source.split(':').slice(1).join(':');
  return source;
};

export { sourceLabel };

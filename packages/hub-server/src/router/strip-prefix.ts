/* @layer hub-core @kind logic */
const stripPrefix = (path: string, prefix: string): string => {
  const bare = path.startsWith(prefix) ? path.slice(prefix.length) : path;
  const trimmed = bare.length > 1 && bare.endsWith('/') ? bare.slice(0, -1) : bare;
  return trimmed || '/';
};

export { stripPrefix };

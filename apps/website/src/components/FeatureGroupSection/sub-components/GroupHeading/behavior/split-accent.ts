/* @layer website-site @kind logic */
const splitAccent = (title: string, accent: string): [string, string, string] => {
  const at = title.indexOf(accent);
  if (at < 0) return [title, '', ''];
  return [title.slice(0, at), accent, title.slice(at + accent.length)];
};

export { splitAccent };

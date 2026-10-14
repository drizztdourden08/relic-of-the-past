/* @layer renderer-hud @kind logic */
const withoutIds = (set: ReadonlySet<string>, ids: readonly string[]): ReadonlySet<string> => {
  const next = new Set(set);
  ids.forEach((id) => next.delete(id));
  return next;
};

export { withoutIds };

/* @layer renderer-components @kind logic */
const capitalizeSetting = (v: unknown, fallback: string): string => {
  const s = String(v ?? fallback);
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export { capitalizeSetting };

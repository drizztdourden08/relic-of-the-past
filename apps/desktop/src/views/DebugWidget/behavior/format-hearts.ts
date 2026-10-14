/* @layer renderer-widgets @kind logic */
const formatHearts = (current: number, capacity: number): string => {
  const full = Math.floor(current / 8);
  const partial = current % 8;
  return `${full}${partial > 0 ? `+${partial}/8` : ''} / ${Math.floor(capacity / 8)}`;
};

export { formatHearts };

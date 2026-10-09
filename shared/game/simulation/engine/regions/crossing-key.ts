/* @layer shared-game @kind logic */
const withoutRegion = (id: string): string => id.replace(/@\d+,\d+/, '');

const crossingKey = (from: string, to: string, edgeSig?: string): string | null => {
  const parts = /^(north|south|east|west):(.+)$/.exec(edgeSig ?? '');
  if (!parts) return null;
  const axis = parts[1] === 'north' || parts[1] === 'south' ? 'ns' : 'ew';
  const [a, b] = withoutRegion(from) < withoutRegion(to)
    ? [withoutRegion(from), withoutRegion(to)]
    : [withoutRegion(to), withoutRegion(from)];
  return `${a}|${b}|${axis}|${parts[2]}`;
};

export { crossingKey };

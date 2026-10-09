/* @layer renderer-lib @kind logic */
const mapName = (names: Map<string, string>, name: string): string => names.get(name) ?? name;

export { mapName };

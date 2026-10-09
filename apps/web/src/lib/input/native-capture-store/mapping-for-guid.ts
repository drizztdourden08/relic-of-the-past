/* @layer renderer-lib @kind logic */
const mappingForGuid = (guid: string): Promise<string | null> => window.api.mappingForGuid(guid);

export { mappingForGuid };

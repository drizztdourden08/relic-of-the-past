/* @layer renderer-lib @kind logic */
const addControllerMapping = (mapping: string): Promise<boolean> => window.api.addControllerMapping(mapping);

export { addControllerMapping };

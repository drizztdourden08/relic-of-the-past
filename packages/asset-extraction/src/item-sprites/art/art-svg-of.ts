/* @layer shared-asset-extraction @kind logic */
import { ART_LIBRARY } from './art-library';

const artSvgOf = (name: string): string => {
  const svg = ART_LIBRARY[name];
  if (svg === undefined) throw new Error(`Unknown art: ${name}`);
  return svg;
};

export { artSvgOf };

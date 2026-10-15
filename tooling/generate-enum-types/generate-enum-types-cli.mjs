/* @layer tooling-scripts @kind logic */
import { generateEnumTypes } from './generate-enum-types.mjs';

generateEnumTypes().then((outPath) => {
  console.log('Wrote', outPath);
});

/**
 * @layer tooling-scripts
 * @kind logic
 *
 * The only file that ever invokes `generateEnumTypes` unprompted. It must stay a
 * file nothing imports: an entry-point check inside the library module fired on
 * every app launch once it was bundled into `dist/electron/main.js` (see the note
 * at the end of generate-enum-types.mjs). Run with `npm run generate:enum-types`.
 */
import { generateEnumTypes } from './generate-enum-types.mjs';

generateEnumTypes().then((outPath) => {
  console.log('Wrote', outPath);
});

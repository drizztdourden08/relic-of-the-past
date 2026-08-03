/**
 * @layer tooling-scripts
 * @kind logic
 *
 * The only file that ever invokes `generateEnumTypes` unprompted.
 *
 * `generate-enum-types.mjs` used to do this itself, guarded by an "am I the
 * process entry point" check (`import.meta.url === pathToFileURL(argv[1])`).
 * That check is unsafe the moment the library module is imported by something
 * else that later gets bundled: `enumeration-writer.ts` imports it and is
 * itself bundled into `dist/electron/main.js`, and launching
 * `electron dist/electron/main.js` makes `argv[1]` literally that same
 * bundled file — which the bundled code's own `import.meta.url` also points
 * at once bundling has folded everything into one file. The check came out
 * true on every single app launch, silently running the CLI path with no
 * caller-supplied root, guessing the wrong one, and crashing every production
 * build with `ERR_MODULE_NOT_FOUND` for a nonexistent `dist/shared/...` path.
 *
 * Splitting the trigger into its own file that nothing ever imports is what
 * makes that impossible structurally, rather than relying on a smarter check:
 * this file is never a dependency of anything else, so it can never end up
 * bundled next to a different real entry point.
 *
 * Run with: `npm run generate:enum-types`.
 */
import { generateEnumTypes } from './generate-enum-types.mjs';

generateEnumTypes().then((outPath) => {
  console.log('Wrote', outPath);
});

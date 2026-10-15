<!-- @layer docs @kind doc -->
# Code notes: tooling

Facts about the repo tools in `tooling/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## tooling/generate-enum-types/tests/enumeration-generated-types.keep.test.ts

`packages/game-data/src/data/enumeration/enumeration.type.ts` is committed, so an edit to `ALL_ENUMERATION` without
`npm run generate:enum-types` would go unnoticed; the suite regenerates it in memory and
compares byte for byte. A category earns a union only when the field it labels stores a
string; the progress tier labels a numeric field, so it is left out of the code generation.

## tooling/generate-enum-types/tests/generate-enum-types-root.keep.test.ts

`generateEnumTypes` takes an explicit `root`. Its default guess is relative to the script's
own file, which is wrong from the bundled `dist/electron/main.js`, so every production launch
once hit `ERR_MODULE_NOT_FOUND`. The fixture seeds one row per category, which
`buildGeneratedTypesSource` needs; every other real category is absent on purpose, proving
the read came from the temp root. The seed is read from the record tree and the union is
written beside the lookup that consumes it.

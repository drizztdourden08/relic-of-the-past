/* @layer bridge-wasm @kind logic */
import type { RomDerived, RomRules } from '@drizztdourden08/brock-port-kit';
import type { RomKindSpec } from '@rotp/roms';

const romRulesOf = (spec: RomKindSpec, derived: RomDerived): RomRules => ({
  extensions: spec.pickExtensions.filter((ext) => ext !== 'zip').map((ext) => `.${ext}`),
  known: Object.fromEntries(spec.sha1.map((hash) => [hash, { id: spec.kind, label: spec.label }])),
  keepFileName: true,
  acceptUnknown: spec.acceptUnknown,
  maxBytes: spec.maxBytes,
  derived,
});

export { romRulesOf };

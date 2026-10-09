/* @layer shared @kind types */
interface AutoDisabledFeature {
  id: string;
  missing: string[];
}

interface ResolveResult {
  effective: Set<string>;
  autoDisabled: AutoDisabledFeature[];
}

export type { AutoDisabledFeature, ResolveResult };

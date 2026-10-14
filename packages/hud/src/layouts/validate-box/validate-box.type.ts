/* @layer shared-hud @kind types */
import type { ValueContext } from '../validate-value.type';

type Issues = string[];

interface ValueSite {
  path: string;
  issues: Issues;
  context: ValueContext;
}

export type { ValueSite, Issues };

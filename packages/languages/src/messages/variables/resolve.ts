/* @layer shared-game @kind logic */
import type { GlossaryTerm, Token } from '../types';
import { resolveRefs } from '../glossary/resolve-refs';
import { ENGINE_SAMPLES, NUMBER_KEY, PLAYER_NAME_KEY } from './builtin';
import type { ResolveOptions, VariableIndex } from './types';

const engineCode = (key: string): Token => {
  if (key === PLAYER_NAME_KEY) return { t: 'var', name: 'player-name' };
  if (key === NUMBER_KEY) return { t: 'var', name: 'number' };
  throw new Error(
    `resolve: "${key}" is marked engine-owned, but the engine has no substitution for it.`,
  );
};

const sampleFor = (key: string, opts: ResolveOptions): string => {
  const supplied = opts.samples?.[key];
  if (supplied !== undefined) return supplied;
  const fallback = ENGINE_SAMPLES[key];
  if (fallback !== undefined) return fallback;
  throw new Error(`resolve: no preview sample for engine variable "${key}".`);
};

const engineToken = (key: string, opts: ResolveOptions): Token => (
  opts.mode === 'bake' ? engineCode(key) : { t: 'text', v: sampleFor(key, opts) }
);

const stage = (token: Token, index: VariableIndex, opts: ResolveOptions): Token => {
  if (token.t === 'var') {
    return opts.mode === 'bake' ? token : { t: 'text', v: sampleFor(token.name, opts) };
  }
  if (token.t !== 'ref') return token;
  const variable = index.get(token.key);
  return variable?.kind === 'engine' ? engineToken(variable.key, opts) : token;
};

const literalTerms = (index: VariableIndex): GlossaryTerm[] => {
  const terms: GlossaryTerm[] = [];
  for (const variable of index.values()) {
    if (variable.value !== null) terms.push({ key: variable.key, value: variable.value });
  }
  return terms;
};

const resolve = (tokens: Token[], index: VariableIndex, opts: ResolveOptions): Token[] =>
  resolveRefs(tokens.map((token) => stage(token, index, opts)), literalTerms(index));

export { resolve };

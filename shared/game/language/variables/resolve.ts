/* @layer shared-game @kind logic */
/**
 * The ONE expansion, used by both the editor's preview and the bake step so the
 * two can never disagree about what a line will say.
 *
 * A reference to a term or a menu name becomes its literal text in both modes —
 * that text is ours and is packed into the dialogue. A reference to an engine
 * variable is the one thing that differs, because the game performs that
 * substitution itself:
 *
 * - `bake` leaves the control code in place (as the `var` token the serializer
 *   writes back), so the packed line still asks the engine to substitute.
 * - `preview` puts a stand-in in its place, so a measured row reflects what a
 *   player will actually see.
 *
 * The literal expansion itself is delegated to `resolveRefs`, keeping one
 * implementation of text merging and of the loud failure on a missing key.
 */
import type { GlossaryTerm, Token } from '../types';
import { resolveRefs } from '../glossary/resolve-refs';
import { ENGINE_SAMPLES, NUMBER_KEY, PLAYER_NAME_KEY } from './builtin';
import type { VariableIndex } from './types';

type ResolveMode = 'bake' | 'preview';

type ResolveOptions = {
  mode: ResolveMode;
  /**
   * Preview stand-ins for the engine variables, keyed by variable key. Falls
   * back to the neutral worst-case samples when a key is not supplied.
   */
  samples?: Record<string, string>;
};

/** The control code the engine reads, as the token the serializer knows. */
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

/**
 * Rewrites only what the literal expansion cannot handle: an engine reference
 * in either mode, and an already-placed control code in preview mode. Anything
 * else is handed on untouched — including a reference to a key the set does not
 * have, so the missing-key failure stays where it has always been.
 */
const stage = (token: Token, index: VariableIndex, opts: ResolveOptions): Token => {
  if (token.t === 'var') {
    return opts.mode === 'bake' ? token : { t: 'text', v: sampleFor(token.name, opts) };
  }
  if (token.t !== 'ref') return token;
  const variable = index.get(token.key);
  return variable?.kind === 'engine' ? engineToken(variable.key, opts) : token;
};

/** Every variable that carries text of its own, in the shape `resolveRefs` takes. */
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
export type { ResolveMode, ResolveOptions };

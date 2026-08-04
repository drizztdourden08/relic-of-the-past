/* @layer shared-game @kind logic */
/**
 * Registry of comparison strategies, shaped exactly like `registry.ts`'s
 * detector registry — one kind, one strategy, same reason: adding a kind
 * should be one registration, not an edit in every consumer that walks kinds.
 */
import type { EntityKind } from '../../data/types';
import type { ComparisonStrategy } from './probe.types';

/**
 * Stored as `ComparisonStrategy<any>`, not `ComparisonStrategy<EntityKind>`:
 * a `FieldProbe`'s `read`/`applies` take the record in a CONTRAVARIANT
 * position, which makes `K` invariant, so `ComparisonStrategy<'screen'>` is
 * not a subtype of `ComparisonStrategy<EntityKind>` (and casting between them
 * fails the overlap check). Every strategy came in through `registerStrategy`
 * already checked against its own real `K`, so the map's `any` only ever
 * holds values that were sound at their point of registration — the same
 * trade the `sets` field in `probe.types.ts` makes, for the same reason.
 */
const strategies = new Map<EntityKind, ComparisonStrategy<any>>();

/** Re-registering a kind replaces it, so a host can override a built-in. */
const registerStrategy = <K extends EntityKind>(strategy: ComparisonStrategy<K>): void => {
  strategies.set(strategy.kind, strategy);
};

const strategyFor = (kind: EntityKind): ComparisonStrategy<EntityKind> | undefined => strategies.get(kind);

const allStrategies = (): readonly ComparisonStrategy<EntityKind>[] => [...strategies.values()];

/** For tests that need a clean registry rather than whatever a barrel installed. */
const clearStrategies = (): void => { strategies.clear(); };

export { allStrategies, clearStrategies, registerStrategy, strategyFor };

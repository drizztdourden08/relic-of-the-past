/* @layer bridge-wasm @kind logic */
/**
 * How many dataset record writes have landed in this session, as an external
 * store (`subscribe` + snapshot) so a consumer can be woken by one.
 *
 * The record registry (`@shared/game/data`) is replaced wholesale on every
 * write and carries no version of its own, so nothing downstream can tell "the
 * same screen" from "the same screen, just edited". Anything that memoises or
 * debounces on a content signature folds this counter in.
 *
 * The subscription is the load-bearing half. A bare counter is only ever
 * SAMPLED during a render, so it would reach a consumer solely when something
 * else happened to re-render it — with the emulator paused, an edit would sit
 * unnoticed indefinitely. Waking subscribers directly removes that dependency
 * on game frames.
 *
 * Contract: every landed create, edit and delete bumps it, at each write
 * family's own shared tail — `settle-created-record.ts` for creates (including
 * the connection pair, which settles once), `record-writers.ts`'s `settle` for
 * edits, and the wrapper in `delete-record.ts`'s `recordDeleterFor` for
 * removals. Accepting a recommendation goes through those same three, so it
 * bumps exactly once and needs no bump of its own.
 */
let revision = 0;

const listeners = new Set<() => void>();

/** Called once per landed write or delete, by whoever performed it. */
const bumpDataRevision = (): void => {
  revision += 1;
  for (const listener of listeners) listener();
};

const dataRevision = (): number => revision;

const subscribeDataRevision = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export { bumpDataRevision, dataRevision, subscribeDataRevision };

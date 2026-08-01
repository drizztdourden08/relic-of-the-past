/* @layer shared-game @kind types */
/**
 * TraversalId — the simulator's own identity for a place, and deliberately NOT a
 * `ScreenId`.
 *
 * The engine keys visited/frontier/route/discovered on the GAME's own number
 * (`room:<roomIndex>` indoors, `ow:<screenIndex>` outdoors — see the live port's
 * observe). Screen DETECTION used to seed it, which meant a room index that
 * collides across a palace and a cave put the virtual player in the wrong place
 * before the first hop; identity no longer depends on the dataset at all.
 *
 * Two consequences worth stating outright, because both used to be silent:
 *   - a TraversalId is not a dataset key. Handing one to a dataset getter returns
 *     a stand-in record, not data, so anything that needs a display name must do
 *     an explicit lookup that can answer "nothing" (see `screenLabel`).
 *   - the static-graph fallback (`buildAdjacency`) walks real `ScreenId`s through
 *     the same fields, so the engine's id space genuinely holds both vocabularies.
 *     That is why this is a named alias rather than a template-literal union: a
 *     union would exclude the very ids the fallback path puts there.
 */
type TraversalId = string;

export type { TraversalId };

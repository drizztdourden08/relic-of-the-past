/* @layer shared-platform @kind logic */
/**
 * THE PRIMARY MODIFIER, ASKED ONCE.
 *
 * Every desktop convention this app borrows from spells the same key two ways:
 * `Ctrl` on Windows and Linux, `Cmd` on macOS. Until now the app said so by
 * hand, inline, as `(e.ctrlKey || e.metaKey)`. That idiom is right on a Mac,
 * right on Windows, and wrong about which key it MEANT everywhere. It cannot be
 * extended either: a gesture that wants "the primary modifier is held right
 * now" per frame (the HUD editor's reparent/nudge split) needs one predicate,
 * not a repeated disjunction.
 *
 * THIS IS A PREDICATE OVER AN EVENT, not a hook and not a store read, so the
 * same answer serves a React `onKeyDown`, a `document` listener and a
 * `pointermove` inside a drag. `os` comes from `Platform.info.os`, which the
 * platform facade already resolves once at start-up. There is no second
 * detection here and there must not be one.
 *
 * UNKNOWN IS NOT WINDOWS. The web host reports `os: 'unknown'` (a browser has no
 * `process.platform` to read), and guessing `Ctrl` there would break the app in
 * Safari on a Mac. With no OS known, EITHER key counts, which is exactly the
 * behaviour the inline idiom had, so adopting this helper at an existing call
 * site changes nothing until the host learns its own OS.
 *
 * NOT FOR GAME INPUT. `lib/input/*`, `BindingListener` and the shadow editor's
 * overlay read RAW keys on purpose, because a rebind screen has to be able to capture
 * the left Control key as itself, and normalising modifiers there would make
 * two physical keys indistinguishable. Those paths are deliberately excluded.
 */
import type { OsKind } from './types';

/** Anything with the two DOM modifier flags: a `KeyboardEvent`, a
 *  `PointerEvent`, a `MouseEvent`, or React's synthetic wrapper for any of
 *  them. Deliberately structural, so nothing has to import a DOM lib type. */
interface ModifierFlags {
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
}

/** The Apple platforms, where the primary modifier is `Cmd` and `Ctrl` is a
 *  secondary that means something else entirely (a right-click, historically). */
const USES_META: ReadonlySet<OsKind> = new Set<OsKind>(['macos', 'ios']);

/**
 * Is the platform's PRIMARY modifier held for this event?
 *
 * `os` omitted, or `'unknown'`, accepts either key (see the header).
 */
const isPrimaryModifier = (event: ModifierFlags, os?: OsKind): boolean => {
  if (os === undefined || os === 'unknown') return event.ctrlKey || event.metaKey;
  return USES_META.has(os) ? event.metaKey : event.ctrlKey;
};

/** What to PRINT for the primary modifier. It is the same decision, for a shortcut
 *  hint or a drag's hint strip, so a label can never disagree with the key that
 *  actually works. */
const primaryModifierLabel = (os?: OsKind): string => (os !== undefined && USES_META.has(os) ? 'Cmd' : 'Ctrl');

export { isPrimaryModifier, primaryModifierLabel };
export type { ModifierFlags };

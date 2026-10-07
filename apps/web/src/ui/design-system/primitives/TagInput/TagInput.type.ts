/* @layer renderer-components @kind types */
import type { RefObject } from 'react';

/**
 * The verdict on one raw entry. `true` means it fits the convention, `false`
 * means it does not and there is no wording to show, and a string means it
 * does not and this is the hint to show.
 *
 * A failing verdict is ADVISORY by default: the value still commits, because a
 * dataset grows values nobody predicted. `enforce` opts one field out of that,
 * for the case where a new value is not a string being appended to a list but a
 * RECORD being created, and a record cannot be filed under a namespace it does
 * not have. Advice stays advice for anything already in the vocabulary;
 * only creation is refused.
 */
type TagValidationResult = boolean | string;

type TagValidator = (raw: string) => TagValidationResult;

interface TagAdvice {
  ok: boolean;
  message: string | null;
}

interface PopupPosition {
  top: number;
  left: number;
  width: number;
  /** The panel hangs off the field's top edge and is shifted up over itself. */
  dropUp: boolean;
}

interface TagInputProps {
  /** The tags currently applied, in order. */
  value: readonly string[];
  onChange: (next: readonly string[]) => void;
  /** Values already in use elsewhere, searched first and offered as rows. */
  suggestions?: readonly string[];
  /** Overrides the built-in `namespace:value` check. Advisory unless `enforce`. */
  validate?: TagValidator;
  /**
   * Refuses to CREATE a value the check rejects. Off by default, so every
   * existing field keeps the advisory behaviour. Picking a value that already
   * exists is never blocked, whatever the check says about it.
   */
  enforce?: boolean;
  /**
   * The reason the most recent create attempt was refused past this control's
   * own check: a server-side revalidation failure the caller could not have
   * predicted (a duplicate, a write it could not make). Shown in the same hint
   * as the convention advice, and cleared the moment the entry is edited again,
   * so a resolved failure never lingers over a value the user has moved on from.
   */
  createError?: string | null;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  /** Cap on the rows the panel shows at once, so a long vocabulary stays usable. */
  maxSuggestions?: number;
  className?: string;
  /** Ties the label to the text entry and seeds the option row ids. */
  id?: string;
}

interface TagChipProps {
  tag: string;
  advice: TagAdvice;
  disabled: boolean;
  onRemove: () => void;
}

interface TagSuggestionPanelProps {
  listId: string;
  optionId: (idx: number) => string;
  panelRef: RefObject<HTMLDivElement | null>;
  /** Null until the field has been measured, so the panel renders unpositioned. */
  pos: PopupPosition | null;
  suggestions: readonly string[];
  /** -1 when nothing is highlighted, which is what hands Enter to the raw text. */
  highlightIdx: number;
  /** The raw text offered as a brand-new value, or null when there is none. */
  createText: string | null;
  onPick: (tag: string) => void;
}

export type {
  PopupPosition,
  TagAdvice,
  TagChipProps,
  TagInputProps,
  TagSuggestionPanelProps,
  TagValidationResult,
  TagValidator,
};
